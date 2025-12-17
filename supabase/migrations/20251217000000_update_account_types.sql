-- Migration: Update account types for Hushh Wealth Investment Accounts
-- Date: 2024-12-17
-- Description: Updates the account_type constraint to support new tier-based account types
--              as per Manish Sainani's feedback:
--              - wealth_1m: Hushh Wealth Investment Account ($1M minimum)
--              - wealth_5m: Hushh Wealth Investment Account ($5M minimum) - Silver tier
--              - ultra_25m: Hushh Ultra High Net Worth Investment Account ($25M minimum) - Gold tier
--              Legacy types (general, retirement) are preserved for backward compatibility

-- Step 1: Drop the existing constraint
ALTER TABLE public.onboarding_data 
DROP CONSTRAINT IF EXISTS onboarding_data_account_type_check;

-- Step 2: Add new constraint with updated account types
-- Includes both new types and legacy types for backward compatibility
ALTER TABLE public.onboarding_data 
ADD CONSTRAINT onboarding_data_account_type_check 
CHECK (account_type = ANY (ARRAY[
  -- New tier-based account types
  'wealth_1m'::text,   -- $1M minimum - Standard tier (Blue/White)
  'wealth_5m'::text,   -- $5M minimum - Silver tier
  'ultra_25m'::text,   -- $25M minimum - Gold/Platinum tier (Ultra High Net Worth)
  -- Legacy account types (for backward compatibility)
  'general'::text,     -- Maps to wealth_1m
  'retirement'::text   -- Maps to wealth_5m
]));

-- Step 3: Update existing records to migrate from legacy to new types (optional)
-- This converts legacy account types to new ones
-- Uncomment the following lines if you want to migrate existing data:

-- UPDATE public.onboarding_data 
-- SET account_type = 'wealth_1m' 
-- WHERE account_type = 'general';

-- UPDATE public.onboarding_data 
-- SET account_type = 'wealth_5m' 
-- WHERE account_type = 'retirement';

-- Step 4: Add comment explaining the account types
COMMENT ON COLUMN public.onboarding_data.account_type IS 
'Account type selected during onboarding. New types: wealth_1m ($1M min, Standard), wealth_5m ($5M min, Silver), ultra_25m ($25M min, Gold/Ultra HNW). Legacy types general and retirement are kept for backward compatibility.';

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Successfully updated account_type constraint to support new tier-based account types';
END $$;
