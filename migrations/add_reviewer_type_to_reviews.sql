-- Add reviewer_type column to reviews table
-- This tracks whether the reviewer is a parent, player, or staff member

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS reviewer_type TEXT;

-- Add check constraint to only allow valid reviewer types
ALTER TABLE reviews
ADD CONSTRAINT reviews_reviewer_type_check 
CHECK (reviewer_type IN ('parent', 'player', 'staff'));

-- Optionally: Set a default value for existing rows (if any)
-- You can choose 'parent' as the default or leave NULL and update manually
UPDATE reviews
SET reviewer_type = 'parent'
WHERE reviewer_type IS NULL;

-- Make the column NOT NULL after backfilling existing rows
ALTER TABLE reviews
ALTER COLUMN reviewer_type SET NOT NULL;

-- Add index for filtering by reviewer type (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_type ON reviews(reviewer_type);

-- Note: After running this migration, you may want to update your RLS policies
-- if they need to differentiate between reviewer types
