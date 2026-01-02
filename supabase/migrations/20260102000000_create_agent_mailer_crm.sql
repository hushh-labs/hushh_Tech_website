-- =====================================================
-- HUSHH AGENT MAILER CRM TABLES
-- Created: Jan 2, 2026
-- 
-- Tables:
-- 1. agent_mailer_logs - Email activity history
-- 2. agent_mailer_contacts - Lead/contact database
-- 3. agent_mailer_campaigns - Email campaign grouping
-- 4. agent_mailer_templates - Saved email templates
-- =====================================================

-- 1. EMAIL LOGS TABLE
-- Stores all sent emails with tracking info
CREATE TABLE IF NOT EXISTS public.agent_mailer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sender info
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    
    -- Recipient info
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    
    -- Email content
    subject TEXT NOT NULL,
    template_used TEXT DEFAULT 'sales_notification',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'OPENED', 'CLICKED', 'REPLIED', 'BOUNCED')),
    gmail_message_id TEXT,
    error_message TEXT,
    
    -- Campaign association (optional)
    campaign_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ
);

-- 2. CONTACTS TABLE
-- Lead/contact database for CRM
CREATE TABLE IF NOT EXISTS public.agent_mailer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    
    -- Company info
    company TEXT,
    designation TEXT,
    
    -- Source tracking
    source TEXT DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'ADFW', 'LINKEDIN', 'WEBSITE', 'REFERRAL', 'IMPORT')),
    
    -- Lead status
    lead_status TEXT DEFAULT 'NEW' CHECK (lead_status IN ('NEW', 'CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'NEGOTIATING', 'WON', 'LOST', 'DORMANT')),
    
    -- Tags and notes
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- Activity tracking
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    last_opened_at TIMESTAMPTZ,
    last_replied_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CAMPAIGNS TABLE
-- Group emails into campaigns
CREATE TABLE IF NOT EXISTS public.agent_mailer_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campaign info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Status
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
    
    -- Template association
    template_id UUID,
    default_subject TEXT,
    
    -- Stats (denormalized for performance)
    total_emails INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 4. TEMPLATES TABLE
-- Saved email templates
CREATE TABLE IF NOT EXISTS public.agent_mailer_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Content
    subject TEXT NOT NULL,
    badge_text TEXT DEFAULT 'Hushh Fund A',
    subtitle TEXT,
    intro_prefix TEXT,
    intro_highlight TEXT,
    intro_suffix TEXT,
    cta_text TEXT DEFAULT 'Connect',
    cta_url TEXT DEFAULT 'https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives',
    
    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Metadata
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_agent_mailer_logs_sender ON public.agent_mailer_logs(sender_email);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_logs_recipient ON public.agent_mailer_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_logs_status ON public.agent_mailer_logs(status);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_logs_created ON public.agent_mailer_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_logs_campaign ON public.agent_mailer_logs(campaign_id);

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_agent_mailer_contacts_email ON public.agent_mailer_contacts(email);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_contacts_company ON public.agent_mailer_contacts(company);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_contacts_status ON public.agent_mailer_contacts(lead_status);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_contacts_source ON public.agent_mailer_contacts(source);
CREATE INDEX IF NOT EXISTS idx_agent_mailer_contacts_tags ON public.agent_mailer_contacts USING GIN(tags);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_agent_mailer_campaigns_status ON public.agent_mailer_campaigns(status);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Link logs to campaigns
ALTER TABLE public.agent_mailer_logs 
ADD CONSTRAINT fk_logs_campaign 
FOREIGN KEY (campaign_id) REFERENCES public.agent_mailer_campaigns(id) ON DELETE SET NULL;

-- Link campaigns to templates
ALTER TABLE public.agent_mailer_campaigns 
ADD CONSTRAINT fk_campaigns_template 
FOREIGN KEY (template_id) REFERENCES public.agent_mailer_templates(id) ON DELETE SET NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.agent_mailer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_mailer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_mailer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_mailer_templates ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (since this is an internal tool without auth)
CREATE POLICY "Allow all for agent_mailer_logs" ON public.agent_mailer_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for agent_mailer_contacts" ON public.agent_mailer_contacts
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for agent_mailer_campaigns" ON public.agent_mailer_campaigns
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for agent_mailer_templates" ON public.agent_mailer_templates
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_agent_mailer_logs_updated_at
    BEFORE UPDATE ON public.agent_mailer_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_mailer_contacts_updated_at
    BEFORE UPDATE ON public.agent_mailer_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_mailer_campaigns_updated_at
    BEFORE UPDATE ON public.agent_mailer_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_mailer_templates_updated_at
    BEFORE UPDATE ON public.agent_mailer_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- DEFAULT TEMPLATE
-- =====================================================

INSERT INTO public.agent_mailer_templates (
    name,
    description,
    subject,
    badge_text,
    subtitle,
    intro_prefix,
    intro_highlight,
    intro_suffix,
    cta_text,
    cta_url,
    is_default
) VALUES (
    'ADFW Follow-up',
    'Default template for ADFW 2025 follow-up emails',
    'Quick follow-up from ADFW - Hushh Fund A',
    'Hushh Fund A',
    'ADFW Follow-up',
    'We met briefly in Abu Dhabi during ADFW in December. I''ve been reflecting on our exchange around',
    'long-duration capital',
    'and how sovereign institutions are thinking about durability in the current productivity cycle.',
    'Connect',
    'https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives',
    TRUE
) ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPER FUNCTION: Log Email Send
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_email_send(
    p_sender_email TEXT,
    p_sender_name TEXT,
    p_recipient_email TEXT,
    p_recipient_name TEXT,
    p_subject TEXT,
    p_status TEXT,
    p_gmail_message_id TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_campaign_id UUID DEFAULT NULL,
    p_template_used TEXT DEFAULT 'sales_notification'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.agent_mailer_logs (
        sender_email,
        sender_name,
        recipient_email,
        recipient_name,
        subject,
        status,
        gmail_message_id,
        error_message,
        campaign_id,
        template_used
    ) VALUES (
        p_sender_email,
        p_sender_name,
        p_recipient_email,
        p_recipient_name,
        p_subject,
        p_status,
        p_gmail_message_id,
        p_error_message,
        p_campaign_id,
        p_template_used
    ) RETURNING id INTO v_log_id;
    
    -- Update contact stats if contact exists
    UPDATE public.agent_mailer_contacts
    SET 
        emails_sent = emails_sent + CASE WHEN p_status = 'SENT' THEN 1 ELSE 0 END,
        last_contacted_at = CASE WHEN p_status = 'SENT' THEN NOW() ELSE last_contacted_at END,
        lead_status = CASE 
            WHEN lead_status = 'NEW' AND p_status = 'SENT' THEN 'CONTACTED'
            ELSE lead_status
        END
    WHERE email = p_recipient_email;
    
    -- Update campaign stats if campaign exists
    IF p_campaign_id IS NOT NULL THEN
        UPDATE public.agent_mailer_campaigns
        SET 
            total_emails = total_emails + 1,
            emails_sent = emails_sent + CASE WHEN p_status = 'SENT' THEN 1 ELSE 0 END
        WHERE id = p_campaign_id;
    END IF;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.agent_mailer_logs IS 'Email activity logs for Hushh Agent Mailer CRM';
COMMENT ON TABLE public.agent_mailer_contacts IS 'Lead/contact database for Hushh Agent Mailer CRM';
COMMENT ON TABLE public.agent_mailer_campaigns IS 'Email campaign groupings for Hushh Agent Mailer CRM';
COMMENT ON TABLE public.agent_mailer_templates IS 'Saved email templates for Hushh Agent Mailer CRM';
