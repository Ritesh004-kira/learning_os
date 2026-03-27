-- Add summary and insights columns to notes table
ALTER TABLE notes ADD COLUMN summary TEXT;
ALTER TABLE notes ADD COLUMN insights JSONB;
