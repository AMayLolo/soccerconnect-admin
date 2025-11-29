-- Optimize search on clubs for ILIKE queries
-- Enable pg_trgm extension (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes to accelerate substring ILIKE on club_name and city
CREATE INDEX IF NOT EXISTS idx_clubs_club_name_trgm
  ON public.clubs USING gin (club_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clubs_city_trgm
  ON public.clubs USING gin (city gin_trgm_ops);

-- Optional: simple btree index on state for equality filter
CREATE INDEX IF NOT EXISTS idx_clubs_state ON public.clubs(state);
