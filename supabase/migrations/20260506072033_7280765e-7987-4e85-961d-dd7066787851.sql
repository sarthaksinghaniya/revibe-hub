
-- 1. Trigger to auto-set organization_id on every new scan
DROP TRIGGER IF EXISTS trg_auto_set_scan_org ON public.scan_history;
CREATE TRIGGER trg_auto_set_scan_org
  BEFORE INSERT ON public.scan_history
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_scan_org();

-- 2. Backfill org_id on existing scans where missing
UPDATE public.scan_history s
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE s.user_id = om.user_id
  AND s.organization_id IS NULL;

-- 3. Update join_org_by_code to backfill scans on join
CREATE OR REPLACE FUNCTION public.join_org_by_code(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  SELECT id INTO _org_id FROM public.organizations WHERE invite_code = _invite_code;
  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'Invalid school code';
  END IF;

  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = _user_id AND organization_id = _org_id) THEN
    RETURN _org_id;
  END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org_id, _user_id, 'member');

  -- Backfill: attach this user's prior scans (no org_id) to this org
  UPDATE public.scan_history
    SET organization_id = _org_id
    WHERE user_id = _user_id AND organization_id IS NULL;

  RETURN _org_id;
END;
$$;

-- 4. Org leaderboard: aggregated per-student stats (admin or self only)
CREATE OR REPLACE FUNCTION public.get_org_leaderboard(_org_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  total_xp integer,
  total_credits integer,
  current_streak integer,
  co2_saved_g numeric,
  scan_count bigint,
  last_scan_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_org_member(auth.uid(), _org_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.total_xp,
    COALESCE(cc.total_credits, 0),
    COALESCE(cc.current_streak, 0),
    COALESCE(cc.co2_saved_g, 0),
    COALESCE(sc.scan_count, 0),
    sc.last_scan_at
  FROM public.organization_members om
  JOIN public.profiles p ON p.user_id = om.user_id
  LEFT JOIN public.carbon_credits cc ON cc.user_id = om.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS scan_count, MAX(created_at) AS last_scan_at
    FROM public.scan_history
    WHERE organization_id = _org_id
    GROUP BY user_id
  ) sc ON sc.user_id = om.user_id
  WHERE om.organization_id = _org_id
  ORDER BY p.total_xp DESC, COALESCE(cc.co2_saved_g, 0) DESC;
END;
$$;

-- 5. Org-wide aggregate stats
CREATE OR REPLACE FUNCTION public.get_org_stats(_org_id uuid)
RETURNS TABLE (
  member_count bigint,
  total_scans bigint,
  total_co2_saved_g numeric,
  active_today bigint,
  scans_this_week bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_org_member(auth.uid(), _org_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.organization_members WHERE organization_id = _org_id),
    (SELECT COUNT(*) FROM public.scan_history WHERE organization_id = _org_id),
    (SELECT COALESCE(SUM(carbon_saved * 1000), 0) FROM public.scan_history WHERE organization_id = _org_id),
    (SELECT COUNT(DISTINCT user_id) FROM public.scan_history
       WHERE organization_id = _org_id AND created_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM public.scan_history
       WHERE organization_id = _org_id AND created_at >= CURRENT_DATE - INTERVAL '7 days');
END;
$$;

-- 6. Index for faster org queries
CREATE INDEX IF NOT EXISTS idx_scan_history_org_user ON public.scan_history(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_org_created ON public.scan_history(organization_id, created_at DESC);
