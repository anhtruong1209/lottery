-- =====================================================
-- Vishipel Lottery - Supabase PostgreSQL Migration Script
-- =====================================================
-- This script creates all necessary tables, indexes, and seed data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable UUID extension (useful for future features)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Drop existing tables if they exist (for clean migration)
-- =====================================================
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS draw_configs CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- =====================================================
-- Table: participants
-- =====================================================
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_participants_name_department ON participants(name, department);

-- =====================================================
-- Table: draw_configs
-- =====================================================
CREATE TABLE draw_configs (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    count INTEGER NOT NULL,
    prize_name VARCHAR(200) DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0
);

-- =====================================================
-- Table: winners
-- =====================================================
CREATE TABLE winners (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER NOT NULL,
    draw_config_id INTEGER NOT NULL,
    won_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_winners_participant FOREIGN KEY (participant_id) 
        REFERENCES participants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_winners_draw_config FOREIGN KEY (draw_config_id) 
        REFERENCES draw_configs(id) ON DELETE RESTRICT
);

-- Create indexes for foreign keys
CREATE INDEX idx_winners_participant_id ON winners(participant_id);
CREATE INDEX idx_winners_draw_config_id ON winners(draw_config_id);

-- =====================================================
-- Table: check_ins
-- =====================================================
CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER NOT NULL,
    device_fingerprint VARCHAR(500) NOT NULL DEFAULT '',
    checked_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT,
    CONSTRAINT fk_checkins_participant FOREIGN KEY (participant_id) 
        REFERENCES participants(id) ON DELETE CASCADE
);

-- Create composite index for check-in lookups
CREATE INDEX idx_checkins_participant_device ON check_ins(participant_id, device_fingerprint);

-- =====================================================
-- Table: users (for authentication)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique index on username
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- =====================================================
-- Seed Data: draw_configs
-- =====================================================
INSERT INTO draw_configs (id, label, count, prize_name, display_order) VALUES
(1, 'Giải An khang', 80, 'Tai nghe bluetooth, sấy tóc', 1),
(2, 'Giải Thịnh Vượng', 30, 'Tăm nước, bàn chải điện', 2),
(3, 'Giải con Ngựa', 1, 'Tivi 55 inches', 3),
(4, 'Giải con Rắn', 1, 'Robot lau nhà', 4),
(5, 'Giải con Mùi, Thân', 2, 'Nồi chiên không dầu, quạt, máy lọc không khí', 5),
(6, 'Giải con Gà, Tuất', 2, 'Nồi chiên không dầu, quạt, máy lọc không khí', 6),
(7, 'Giải Hợi, Tý, Sửu, Dần, Mẹo, Thìn', 6, 'Bếp lẩu, bếp hồng ngoại, massage cổ', 7);

-- Reset sequence for draw_configs to continue from 8
SELECT setval('draw_configs_id_seq', 7, true);

-- =====================================================
-- Table: app_settings (for customization)
-- =====================================================
CREATE TABLE app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) NOT NULL DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Create unique index on setting_key for fast lookups
CREATE UNIQUE INDEX idx_app_settings_key ON app_settings(setting_key);

-- =====================================================
-- Seed Data: app_settings
-- =====================================================
INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'VISHIPEL', 'text', 'Tên công ty hiển thị trên giao diện'),
('logo_url', '/images/default-logo.png', 'image', 'URL logo công ty'),
('background_url', '/images/default-bg.jpg', 'image', 'URL ảnh background'),
('primary_color', '#1e40af', 'color', 'Màu chủ đạo của theme'),
('secondary_color', '#3b82f6', 'color', 'Màu phụ của theme'),
('event_title', 'CHƯƠNG TRÌNH QUAY THƯỞNG', 'text', 'Tiêu đề sự kiện'),
('event_year', '2026', 'text', 'Năm tổ chức sự kiện');

-- =====================================================
-- Enable Row Level Security (RLS) - Optional but recommended
-- =====================================================
-- Uncomment these if you want to use Supabase RLS policies

-- ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE draw_configs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy: Allow all operations for authenticated users
-- CREATE POLICY "Allow all for authenticated users" ON participants
--     FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the migration was successful:

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check draw_configs seed data
SELECT * FROM draw_configs ORDER BY display_order;

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Update your Backend appsettings.json with Supabase connection string
-- 2. Install Npgsql.EntityFrameworkCore.PostgreSQL package
-- 3. Update DbContext for PostgreSQL compatibility
-- 4. Test your application
