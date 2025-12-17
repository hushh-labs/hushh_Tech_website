-- Migration: Add share class unit columns to onboarding_data
-- Date: 2024-12-17
-- Description: Adds columns to track the number of units selected for each share class:
--              - class_a_units: $25M per unit (Ultra High Net Worth)
--              - class_b_units: $5M per unit (Premium)
--              - class_c_units: $1M per unit (Standard)

-- Step 1: Add share class unit columns
ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS class_a_units integer DEFAULT 0 CHECK (class_a_units >= 0);

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS class_b_units integer DEFAULT 0 CHECK (class_b_units >= 0);

ALTER TABLE public.onboarding_data 
ADD COLUMN IF NOT EXISTS class_c_units integer DEFAULT 0 CHECK (class_c_units >= 0);

-- Step 2: Add comments explaining the columns
COMMENT ON COLUMN public.onboarding_data.class_a_units IS 
'Number of Class A share units selected ($25M per unit - Ultra High Net Worth tier)';

COMMENT ON COLUMN public.onboarding_data.class_b_units IS 
'Number of Class B share units selected ($5M per unit - Premium tier)';

COMMENT ON COLUMN public.onboarding_data.class_c_units IS 
'Number of Class C share units selected ($1M per unit - Standard tier)';

-- Step 3: Create an index for querying by share class selections
CREATE INDEX IF NOT EXISTS idx_onboarding_share_units 
ON public.onboarding_data (class_a_units, class_b_units, class_c_units) 
WHERE class_a_units > 0 OR class_b_units > 0 OR class_c_units > 0;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Successfully added share class unit columns (class_a_units, class_b_units, class_c_units)';
END $$;
