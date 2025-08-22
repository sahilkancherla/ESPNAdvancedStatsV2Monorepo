-- First drop the old foreign key constraint if it exists
ALTER TABLE leagues DROP CONSTRAINT IF EXISTS leagues_admin_user_id_fkey;

-- Change admin_user_id column from uuid to text
ALTER TABLE leagues
ALTER COLUMN admin_user_id DROP DEFAULT,
ALTER COLUMN admin_user_id TYPE text USING admin_user_id::text;

-- Optionally add a new foreign key if needed later
-- For now, we’re just making it text without FK
