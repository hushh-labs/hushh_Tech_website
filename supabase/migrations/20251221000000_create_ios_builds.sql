-- Create ios_builds table for tracking TestFlight deployments
-- This table stores build history and status for the iOS CI/CD automation

CREATE TABLE IF NOT EXISTS ios_builds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    build_number INTEGER NOT NULL UNIQUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'uploading', 'processing', 'ready', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    ipa_size VARCHAR(20),
    triggered_by VARCHAR(100) DEFAULT 'manual',
    commit_hash VARCHAR(40),
    branch VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ios_builds_build_number ON ios_builds(build_number DESC);
CREATE INDEX IF NOT EXISTS idx_ios_builds_status ON ios_builds(status);
CREATE INDEX IF NOT EXISTS idx_ios_builds_created_at ON ios_builds(created_at DESC);

-- Enable RLS
ALTER TABLE ios_builds ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view builds
CREATE POLICY "Allow authenticated users to view ios_builds"
ON ios_builds FOR SELECT
TO authenticated
USING (true);

-- Allow service role to insert/update builds
CREATE POLICY "Allow service role to manage ios_builds"
ON ios_builds FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_ios_builds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ios_builds_updated_at
    BEFORE UPDATE ON ios_builds
    FOR EACH ROW
    EXECUTE FUNCTION update_ios_builds_updated_at();

-- Add comment
COMMENT ON TABLE ios_builds IS 'Tracks iOS TestFlight build history and status for CI/CD automation';
