
CREATE OR REPLACE FUNCTION public.join_org_by_code(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  -- Find org by invite code
  SELECT id INTO _org_id FROM public.organizations WHERE invite_code = _invite_code;
  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'Invalid school code';
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = _user_id AND organization_id = _org_id) THEN
    RETURN _org_id;
  END IF;

  -- Add as member
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org_id, _user_id, 'member');

  RETURN _org_id;
END;
$$;
