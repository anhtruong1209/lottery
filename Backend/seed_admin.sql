-- Seed admin user for Vishipel Lottery
-- Username: admin
-- Password: admin
-- Role: Admin

INSERT INTO users (username, password_hash, role, created_at)
VALUES ('admin', '$2a$11$ZxCmU9OgSAkZAp8MJ8JViOQr8WlQx0p9A5rCm4k5cZa8KxMgWm7Z2', 'Admin', NOW() AT TIME ZONE 'UTC')
ON CONFLICT (username) DO NOTHING;
