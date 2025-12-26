-- Create identity_verifications table for Stripe Identity verification
-- This stores the verification session data and results

CREATE TABLE IF NOT EXISTS identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe session info
  stripe_session_id TEXT UNIQUE,
  stripe_verification_flow_id TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  -- Possible statuses: pending, processing, verified, requires_input, canceled, failed
  
  -- Verified data from Stripe
  verified_first_name TEXT,
  verified_last_name TEXT,
  verified_date_of_birth DATE,
  verified_id_number TEXT,
  verified_document_type TEXT, -- passport, driving_license, id_card
  verified_document_country TEXT,
  verified_address_line1 TEXT,
  verified_address_city TEXT,
  verified_address_state TEXT,
  verified_address_postal_code TEXT,
  verified_address_country TEXT,
  
  -- Verification checks
  document_verified BOOLEAN DEFAULT FALSE,
  selfie_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Provided details (prepopulated)
  provided_email TEXT,
  provided_phone TEXT,
  
  -- Stripe raw response (for debugging/audit)
  stripe_response JSONB,
  
  -- Risk assessment
  risk_score TEXT, -- low, medium, high
  risk_insights JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'verified', 'requires_input', 'canceled', 'failed'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_stripe_session_id ON identity_verifications(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);

-- Enable RLS
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own verification records
CREATE POLICY "Users can view own verifications"
  ON identity_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via edge functions)
CREATE POLICY "Service role can manage verifications"
  ON identity_verifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add is_identity_verified column to onboarding_data if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_data' AND column_name = 'is_identity_verified'
  ) THEN
    ALTER TABLE onboarding_data ADD COLUMN is_identity_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_data' AND column_name = 'identity_verification_id'
  ) THEN
    ALTER TABLE onboarding_data ADD COLUMN identity_verification_id UUID REFERENCES identity_verifications(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_data' AND column_name = 'identity_verified_at'
  ) THEN
    ALTER TABLE onboarding_data ADD COLUMN identity_verified_at TIMESTAMPTZ;
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_identity_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_update_identity_verifications_updated_at ON identity_verifications;
CREATE TRIGGER trigger_update_identity_verifications_updated_at
  BEFORE UPDATE ON identity_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_identity_verifications_updated_at();

-- Comment for documentation
COMMENT ON TABLE identity_verifications IS 'Stores Stripe Identity verification sessions and results';
COMMENT ON COLUMN identity_verifications.status IS 'pending=not started, processing=in progress, verified=success, requires_input=needs more info, canceled=user canceled, failed=verification failed';
