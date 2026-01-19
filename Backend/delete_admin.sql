-- Delete existing admin user (if any) so the backend can recreate it with correct password
DELETE FROM users WHERE username = 'admin';
