-- Drop existing tables if they exist
DROP TABLE IF EXISTS study_sessions;
DROP TABLE IF EXISTS weekly_progress;
DROP TABLE IF EXISTS subjects;

-- Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Create study_sessions table
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  minutes_studied INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create weekly_progress table
CREATE TABLE weekly_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  minutes_studied INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subjects"
  ON subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects"
  ON subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects"
  ON subjects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects"
  ON subjects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
  ON study_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own weekly progress"
  ON weekly_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly progress"
  ON weekly_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly progress"
  ON weekly_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly progress"
  ON weekly_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to manage default subject
CREATE OR REPLACE FUNCTION create_default_subject()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if default subject exists
  SELECT id INTO v_subject_id
  FROM subjects
  WHERE user_id = v_user_id
  AND name = 'Sem matéria';

  -- If not exists, create it
  IF v_subject_id IS NULL THEN
    INSERT INTO subjects (user_id, name, color)
    VALUES (v_user_id, 'Sem matéria', '#6B7280')
    RETURNING id INTO v_subject_id;
  END IF;

  RETURN v_subject_id;
END;
$$; 