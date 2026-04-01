-- SQL Script to make mobolajioyesaga@gmail.com an admin
-- Run this in your Supabase dashboard SQL Editor

-- First, find the user ID (replace with actual email if different)
-- You can see the user ID in Authentication > Users table

-- Insert or update the profile with admin role
INSERT INTO profiles (id, email, role, created_at)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID from Authentication > Users
  'mobolajioyesaga@gmail.com',
  'admin',
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = 'mobolajioyesaga@gmail.com';

-- Verify the admin was created
SELECT * FROM profiles WHERE email = 'mobolajioyesaga@gmail.com';
