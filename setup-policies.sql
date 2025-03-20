
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access for events" 
ON events FOR SELECT 
USING (true);

-- Create policy for authenticated users to create events
CREATE POLICY "Authenticated users can create events" 
ON events FOR INSERT 
TO authenticated 
USING (true);

-- Enable RLS on registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create registrations
CREATE POLICY "Anyone can create registrations" 
ON registrations FOR INSERT 
USING (true);

-- Public can view their own registrations by email
CREATE POLICY "Public can view registrations by email" 
ON registrations FOR SELECT 
USING (true);
      