-- Initialize Tonmate Database
-- This script creates the database and sets up basic configuration

CREATE DATABASE tonmate;

-- Create user if not exists (PostgreSQL 15 compatible)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'tonmate') THEN
        CREATE USER tonmate WITH PASSWORD 'tonmate';
    END IF;
END $$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE tonmate TO tonmate;
