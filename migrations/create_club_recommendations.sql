-- Create club_recommendations table
CREATE TABLE IF NOT EXISTS club_recommendations (
  id BIGSERIAL PRIMARY KEY,
  club_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  website_url TEXT,
  additional_info TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_club_recommendations_status ON club_recommendations(status);

-- Create index on submitted_by for user lookups
CREATE INDEX IF NOT EXISTS idx_club_recommendations_submitted_by ON club_recommendations(submitted_by);

-- Enable RLS
ALTER TABLE club_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert recommendations
CREATE POLICY "Anyone can insert club recommendations"
  ON club_recommendations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view their own recommendations"
  ON club_recommendations
  FOR SELECT
  USING (auth.uid() = submitted_by);

-- Policy: Admins can view all recommendations (assuming you have an is_admin column in profiles or similar)
-- Adjust this based on your admin logic
CREATE POLICY "Admins can view all recommendations"
  ON club_recommendations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update recommendations
CREATE POLICY "Admins can update recommendations"
  ON club_recommendations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_club_recommendations_updated_at
  BEFORE UPDATE ON club_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
