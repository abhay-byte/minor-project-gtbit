-- Migration script to create tables for user feedback and interaction.
-- Version: 4
-- Depends on: 003_create_discovery_and_records_tables.sql

-- Begin a transaction
BEGIN;

-- Create a custom ENUM type for the chat message sender.
CREATE TYPE sender_type AS ENUM (
    'User',
    'AI'
);

-- 1. Create the 'reviews' table
-- This table is designed with a polymorphic relationship to store patient feedback
-- for different types of entities, such as appointments or clinic doctors.
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    target_type VARCHAR(50) NOT NULL, -- e.g., 'Appointment', 'Clinic_Doctor'
    target_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_patient
        FOREIGN KEY(patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE -- If a patient is deleted, their reviews are also deleted.
);

COMMENT ON TABLE reviews IS 'A flexible table to store patient feedback and ratings.';
COMMENT ON COLUMN reviews.target_type IS 'The type of entity being reviewed (e.g., ''Appointment'').';
COMMENT ON COLUMN reviews.target_id IS 'The ID of the specific entity being reviewed.';


-- 2. Create the 'ai_chat_logs' table
-- This table stores the full conversation history between a user and the AI Care Companion.
CREATE TABLE ai_chat_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message_content TEXT NOT NULL,
    sender sender_type NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE -- If a user is deleted, their chat history is also deleted.
);

COMMENT ON TABLE ai_chat_logs IS 'Stores the conversation history for the AI Care Companion.';
COMMENT ON COLUMN ai_chat_logs.sender IS 'Indicates who sent the message (User or AI). Used to align chat bubbles in the UI.';

-- Add indexes for performance. A composite index on the polymorphic columns
-- in the reviews table is particularly useful for fetching reviews for a specific item.
CREATE INDEX idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_ai_chat_logs_user_id ON ai_chat_logs(user_id);

-- Commit the transaction
COMMIT;
