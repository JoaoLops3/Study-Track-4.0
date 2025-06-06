CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own github integrations"
  ON github_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own github integrations"
  ON github_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github integrations"
  ON github_integrations FOR UPDATE
  USING (auth.uid() = user_id); 