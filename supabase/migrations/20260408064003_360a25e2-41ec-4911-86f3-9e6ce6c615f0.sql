
-- 1. Update handle_new_user to also set account_type from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _acct_type text;
BEGIN
  _acct_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual');
  
  INSERT INTO public.profiles (user_id, display_name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    _acct_type::account_type
  );
  
  INSERT INTO public.carbon_credits (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- 2. Allow org members to view profiles of fellow org members (for leaderboard)
CREATE POLICY "Org members can view fellow member profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om1
    JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.user_id
  )
);

-- 3. Auto-set organization_id on scan_history when a member scans
CREATE OR REPLACE FUNCTION public.auto_set_scan_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- If org_id already set, skip
  IF NEW.organization_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find user's org (take first if multiple)
  SELECT organization_id INTO _org_id
  FROM public.organization_members
  WHERE user_id = NEW.user_id
  LIMIT 1;
  
  IF _org_id IS NOT NULL THEN
    NEW.organization_id := _org_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_scan_org_before_insert
BEFORE INSERT ON public.scan_history
FOR EACH ROW
EXECUTE FUNCTION public.auto_set_scan_org();
