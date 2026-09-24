
-- Listings table
CREATE TABLE public.listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  is_free boolean DEFAULT false,
  category text NOT NULL,
  waste_type text,
  images text[],
  location_city text,
  location_state text,
  contact_whatsapp text,
  contact_email text,
  status text DEFAULT 'active',
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Saved/wishlist table
CREATE TABLE public.saved_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Listings RLS policies
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- Saved listings RLS policies
CREATE POLICY "Users can view own saved" ON public.saved_listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings" ON public.saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings" ON public.saved_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own listing images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own listing images" ON storage.objects
  FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_listing_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'sold', 'removed') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_listing_status_trigger
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.validate_listing_status();
