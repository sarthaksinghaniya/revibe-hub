
-- Create account type enum
CREATE TYPE public.account_type AS ENUM ('student', 'individual', 'company', 'school');

-- Create org role enum
CREATE TYPE public.org_role AS ENUM ('admin', 'member');

-- Create waste category enum
CREATE TYPE public.waste_category AS ENUM ('recyclable', 'compostable', 'hazardous', 'landfill', 'upcyclable');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  account_type account_type NOT NULL DEFAULT 'individual',
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Scan history table
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category waste_category NOT NULL,
  disposal_method TEXT,
  material TEXT,
  carbon_saved NUMERIC NOT NULL DEFAULT 0,
  credits_earned INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Carbon credits table (one row per user)
CREATE TABLE public.carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_scan_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;

-- Helper functions (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id AND role = 'admin'
  );
$$;

-- Organization RLS policies
CREATE POLICY "Members can view their org" ON public.organizations
  FOR SELECT USING (public.is_org_member(auth.uid(), id));
CREATE POLICY "Anyone can create org" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update org" ON public.organizations
  FOR UPDATE USING (public.is_org_admin(auth.uid(), id));

-- Organization members RLS
CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can add members" ON public.organization_members
  FOR INSERT WITH CHECK (
    public.is_org_admin(auth.uid(), organization_id) OR auth.uid() = user_id
  );
CREATE POLICY "Admins can update members" ON public.organization_members
  FOR UPDATE USING (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Admins can remove members" ON public.organization_members
  FOR DELETE USING (public.is_org_admin(auth.uid(), organization_id) OR auth.uid() = user_id);

-- Scan history RLS
CREATE POLICY "Users can view own scans" ON public.scan_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Org admins can view member scans" ON public.scan_history
  FOR SELECT USING (
    organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id)
  );
CREATE POLICY "Users can insert own scans" ON public.scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Carbon credits RLS
CREATE POLICY "Users can view own credits" ON public.carbon_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.carbon_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.carbon_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.carbon_credits (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carbon_credits_updated_at BEFORE UPDATE ON public.carbon_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for scan_history and carbon_credits
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_credits;
