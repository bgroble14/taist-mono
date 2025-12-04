-- Update the version to 29.0.0
-- Run this on your Railway database

-- First, check what's currently in the table
SELECT * FROM versions;

-- Update the version to match the app
UPDATE versions SET version = '29.0.0', updated_at = NOW() WHERE id = 1;

-- If the table is empty, insert a new record
INSERT INTO versions (version, created_at, updated_at)
SELECT '29.0.0', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM versions WHERE id = 1);

-- Verify the update
SELECT * FROM versions;
