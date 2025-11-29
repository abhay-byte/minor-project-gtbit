-- Add session_id column to ai_chat_logs table
-- This enables linking chat messages to specific AI sessions

ALTER TABLE ai_chat_logs 
ADD COLUMN session_id UUID REFERENCES ai_chat_sessions(session_id);

-- Create index for better performance when querying by session_id
CREATE INDEX idx_ai_chat_logs_session_id ON ai_chat_logs(session_id);

-- Update existing records to link to sessions where possible
-- This is a best-effort approach based on user_id and timestamp proximity
-- NOTE: This is a complex operation and may need to be adapted based on actual data

-- Add a comment about this migration
COMMENT ON COLUMN ai_chat_logs.session_id IS 'References the AI chat session this message belongs to';