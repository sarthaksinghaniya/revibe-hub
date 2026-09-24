
-- 1. Atomic create_org function (bypasses RLS timing issue)
CREATE OR REPLACE FUNCTION public.create_org(_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.organizations (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org_id, _user_id, 'admin');

  RETURN _org_id;
END;
$$;

-- 2. Remove member function for admins
CREATE OR REPLACE FUNCTION public.remove_org_member(_org_id uuid, _member_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Cannot remove yourself
  IF _member_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself';
  END IF;

  DELETE FROM public.organization_members
  WHERE organization_id = _org_id AND user_id = _member_user_id;
END;
$$;
