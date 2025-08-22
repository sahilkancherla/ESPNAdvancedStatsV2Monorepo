-- Step 1: Convert text to uuid
ALTER TABLE leagues
ALTER COLUMN admin_user_id DROP DEFAULT,
ALTER COLUMN admin_user_id TYPE uuid USING admin_user_id::uuid;

-- Step 2: Restore foreign key constraint to users(id)
ALTER TABLE leagues
ADD CONSTRAINT leagues_admin_user_id_fkey
FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL;