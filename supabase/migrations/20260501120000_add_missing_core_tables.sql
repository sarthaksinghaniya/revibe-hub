-- Scan History table for waste scan records
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  category waste_category NOT NULL,
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  image_url TEXT,
  eco_tips TEXT,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON public.scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create scans" ON public.scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Org members can view org scans" ON public.scan_history
  FOR SELECT USING (
    organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = scan_history.organization_id 
      AND om.user_id = auth.uid()
    )
  );

-- Carbon Credits / Points table
CREATE TABLE public.carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_week_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_scan_date DATE,
  milestone_badges TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON public.carbon_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.carbon_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Friendships table for user connections
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can accept/block requests" ON public.friendships
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Add friend_code column to profiles (for friend requests by code)
ALTER TABLE public.profiles 
ADD COLUMN friend_code TEXT UNIQUE DEFAULT substring(md5(random()::text || clock_timestamp()::text), 1, 8);

-- Leaderboard view (aggregated stats for rankings)
CREATE VIEW public.leaderboard AS
SELECT
  p.id,
  p.user_id,
  p.display_name,
  p.avatar_url,
  cc.total_points,
  cc.current_streak,
  COUNT(DISTINCT sh.id) as total_scans,
  RANK() OVER (ORDER BY cc.total_points DESC) as rank
FROM public.profiles p
LEFT JOIN public.carbon_credits cc ON p.user_id = cc.user_id
LEFT JOIN public.scan_history sh ON p.user_id = sh.user_id
GROUP BY p.id, p.user_id, p.display_name, p.avatar_url, cc.total_points, cc.current_streak;

-- Helper function: Check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
    AND organization_id = _org_id
    AND role = 'admin'
  );
$$;

-- Award points function (called after scan)
CREATE OR REPLACE FUNCTION public.award_scan_points(_user_id uuid, _category waste_category)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _points integer;
  _current_streak integer;
  _streak_multiplier NUMERIC := 1.0;
  _awarded_points integer;
BEGIN
  -- Base points by category
  _points := CASE _category
    WHEN 'recyclable'::waste_category THEN 10
    WHEN 'compostable'::waste_category THEN 8
    WHEN 'upcyclable'::waste_category THEN 12
    WHEN 'hazardous'::waste_category THEN 15
    WHEN 'landfill'::waste_category THEN 2
    ELSE 5
  END;

  -- Get current streak and apply multiplier
  SELECT current_streak INTO _current_streak FROM public.carbon_credits WHERE user_id = _user_id;
  
  IF _current_streak >= 7 THEN
    _streak_multiplier := 3.0;
  ELSIF _current_streak >= 3 THEN
    _streak_multiplier := 2.0;
  ELSIF _current_streak >= 1 THEN
    _streak_multiplier := 1.5;
  END IF;

  _awarded_points := FLOOR(_points * _streak_multiplier)::integer;

  -- Update carbon credits
  UPDATE public.carbon_credits
  SET
    total_points = total_points + _awarded_points,
    current_week_points = current_week_points + _awarded_points,
    last_scan_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = _user_id;

  RETURN _awarded_points;
END;
$$;
