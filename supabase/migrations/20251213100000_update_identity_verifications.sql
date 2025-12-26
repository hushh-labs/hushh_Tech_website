-- Update identity_verifications table for Stripe Identity verification
-- Add missing columns to existing table

-- Add stripe_verification_flow_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'stripe_verification_flow_id'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN stripe_verification_flow_id TEXT;
  END IF;
END $$;

-- Add document_verified if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'document_verified'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN document_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add email_verified if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add phone_verified if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add provided_email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'provided_email'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN provided_email TEXT;
  END IF;
END $$;

-- Add provided_phone if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'provided_phone'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN provided_phone TEXT;
  END IF;
END $$;

-- Add risk_score if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'risk_score'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN risk_score TEXT;
  END IF;
END $$;

-- Add risk_insights if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'identity_verifications' AND column_name = 'risk_insights'
  ) THEN
    ALTER TABLE identity_verifications ADD COLUMN risk_insights JSONB;
  END IF;
END $$;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_stripe_session_id ON identity_verifications(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_stripe_status ON identity_verifications(stripe_status);

-- Enable RLS if not already
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view own verifications" ON identity_verifications;
DROP POLICY IF EXISTS "Service role can manage verifications" ON identity_verifications;

-- Users can read their own verification records
CREATE POLICY "Users can view own verifications"
  ON identity_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all verifications
CREATE POLICY "Service role can manage verifications"
  ON identity_verifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add columns to onboarding_data if not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_data' AND column_name = 'identity_verified'
  ) THEN
    ALTER TABLE onboarding_data ADD COLUMN identity_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

COMMENT ON TABLE identity_verifications IS 'Stores Stripe Identity verification sessions and results';
