-- Migration: Add banking information columns to onboarding_data
-- This adds fields to collect wire transfer banking details
-- As requested by Manish Sainani (since Plaid is not currently working)

-- Add banking information columns
ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_name text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_account_holder_name text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_account_number_encrypted text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_routing_number text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_swift_code text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_address_city text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_address_country text;

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS bank_account_type text;

-- Add constraint for account type
ALTER TABLE public.onboarding_data 
DROP CONSTRAINT IF EXISTS onboarding_data_bank_account_type_check;

ALTER TABLE public.onboarding_data 
ADD CONSTRAINT onboarding_data_bank_account_type_check 
CHECK (bank_account_type IS NULL OR bank_account_type IN ('checking', 'savings'));

-- Track if user skipped banking info
ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS banking_info_skipped boolean DEFAULT false;

-- Track when banking info was submitted
ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS banking_info_submitted_at timestamp with time zone;

-- Update current_step constraint to allow step 15
ALTER TABLE public.onboarding_data 
DROP CONSTRAINT IF EXISTS onboarding_data_current_step_check;

ALTER TABLE public.onboarding_data 
ADD CONSTRAINT onboarding_data_current_step_check 
CHECK (current_step >= 1 AND current_step <= 15);

-- Add comment for documentation
COMMENT ON COLUMN public.onboarding_data.bank_account_number_encrypted IS 'Encrypted bank account number for wire transfers';
COMMENT ON COLUMN public.onboarding_data.bank_swift_code IS 'SWIFT/BIC code for international wire transfers';
COMMENT ON COLUMN public.onboarding_data.banking_info_skipped IS 'True if user chose to skip banking info and submit later';
