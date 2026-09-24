-- Add CO2 reservoir to carbon_credits table
ALTER TABLE public.carbon_credits 
  ADD COLUMN IF NOT EXISTS co2_saved_g numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS co2_pending_g numeric NOT NULL DEFAULT 0;

-- co2_saved_g  = lifetime total CO2 grams saved (never decreases)
-- co2_pending_g = unminted reservoir; resets to remainder after CC mint

COMMENT ON COLUMN public.carbon_credits.co2_saved_g IS 'Lifetime total CO2 saved in grams (Indian baseline data).';
COMMENT ON COLUMN public.carbon_credits.co2_pending_g IS 'Unminted CO2 grams; converts to 1 CC for every 1000g (1kg) crossed.';
