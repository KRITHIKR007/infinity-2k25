
-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TIMESTAMPTZ,
  time TEXT,
  venue TEXT,
  rules TEXT,
  max_participants INTEGER,
  fee NUMERIC DEFAULT 0,
  team_size INTEGER,
  status TEXT DEFAULT 'active',
  image_url TEXT,
  prize_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  university TEXT,
  events JSONB DEFAULT '[]',
  event_name TEXT,
  category TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_id UUID,
  payment_proof_url TEXT,
  payment_method TEXT,
  team_name TEXT,
  team_members JSONB DEFAULT '[]',
  fee NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  proof_url TEXT,
  proof_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID,
  event_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT now()
);
