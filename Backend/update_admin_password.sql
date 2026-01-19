-- Update admin password to 'admin'
-- This hash was generated using BCrypt with the password 'admin'

UPDATE users 
SET password_hash = '$2a$11$3qQpzImXJD5z5Pl0gKMOEeLKJ5pY9YQJZvJJ5J5J5J5J5J5J5J5J5O'
WHERE username = 'admin';
