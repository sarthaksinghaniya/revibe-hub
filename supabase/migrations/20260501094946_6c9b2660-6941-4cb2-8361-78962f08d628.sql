ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS image_hash text;
ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS reduced_credits boolean DEFAULT false;
ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS source text DEFAULT 'scan';
CREATE INDEX IF NOT EXISTS idx_scan_history_user_hash ON public.scan_history(user_id, image_hash);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_cat_time ON public.scan_history(user_id, category, created_at);