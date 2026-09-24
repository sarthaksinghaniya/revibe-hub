-- Create friend request atomically by friend code.
-- SECURITY DEFINER bypasses profile RLS for code lookup while preserving controlled behavior.
CREATE OR REPLACE FUNCTION public.create_friend_request_by_code(_friend_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _target_id uuid;
  _existing_id uuid;
  _normalized_code text := upper(trim(_friend_code));
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _normalized_code IS NULL OR _normalized_code = '' THEN
    RAISE EXCEPTION 'Friend code is required';
  END IF;

  SELECT p.user_id
    INTO _target_id
  FROM public.profiles p
  WHERE upper(p.friend_code) = _normalized_code
  LIMIT 1;

  IF _target_id IS NULL THEN
    RAISE EXCEPTION 'No user found with that code';
  END IF;

  IF _target_id = _user_id THEN
    RAISE EXCEPTION 'That is your own code';
  END IF;

  SELECT f.id
    INTO _existing_id
  FROM public.friendships f
  WHERE (f.requester_id = _user_id AND f.receiver_id = _target_id)
     OR (f.requester_id = _target_id AND f.receiver_id = _user_id)
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Already friends or request pending';
  END IF;

  INSERT INTO public.friendships (requester_id, receiver_id, status)
  VALUES (_user_id, _target_id, 'pending')
  RETURNING id INTO _existing_id;

  RETURN _existing_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_friend_request_by_code(text) TO authenticated;
