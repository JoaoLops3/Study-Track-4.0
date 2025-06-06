-- Drop existing table if it exists
DROP TABLE IF EXISTS public.google_calendar_integrations CASCADE;

-- Create table for Google Calendar integrations
CREATE TABLE public.google_calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    calendar_id TEXT NOT NULL DEFAULT 'primary',
    calendar_summary TEXT,
    calendar_timezone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.google_calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own Google Calendar integrations" ON public.google_calendar_integrations;
DROP POLICY IF EXISTS "Users can insert their own Google Calendar integrations" ON public.google_calendar_integrations;
DROP POLICY IF EXISTS "Users can update their own Google Calendar integrations" ON public.google_calendar_integrations;
DROP POLICY IF EXISTS "Users can delete their own Google Calendar integrations" ON public.google_calendar_integrations;

-- Create policies
CREATE POLICY "Users can view their own Google Calendar integrations"
    ON public.google_calendar_integrations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Calendar integrations"
    ON public.google_calendar_integrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar integrations"
    ON public.google_calendar_integrations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar integrations"
    ON public.google_calendar_integrations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_user_id ON public.google_calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_token_expires_at ON public.google_calendar_integrations(token_expires_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_google_calendar_integrations_updated_at ON public.google_calendar_integrations;

CREATE TRIGGER update_google_calendar_integrations_updated_at
    BEFORE UPDATE ON public.google_calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.google_calendar_integrations TO authenticated;
GRANT ALL ON public.google_calendar_integrations TO service_role; 