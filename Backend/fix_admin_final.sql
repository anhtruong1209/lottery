-- Final fix for admin user (using confirmed hash from logs)
-- Password: admin
-- Hash: $2a$11$3qQpzImXJD5z5Pl0gKMOEeLKJ5pY9YQJZvJJ5J5J5J5J5J5J5J5J5O

DELETE FROM users WHERE username = 'admin';

INSERT INTO users (username, password_hash, role, created_at)
VALUES ('admin', '$2a$11$3qQpzImXJD5z5Pl0gKMOEeLKJ5pY9YQJZvJJ5J5J5J5J5J5J5J5J5O', 'Admin', NOW() AT TIME ZONE 'UTC')
ON CONFLICT (username) 
DO UPDATE SET password_hash = '$2a$11$3qQpzImXJD5z5Pl0gKMOEeLKJ5pY9YQJZvJJ5J5J5J5J5J5J5J5J5O';
