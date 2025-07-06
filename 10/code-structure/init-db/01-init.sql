-- Initialize StudyMate Database Schema
-- This script runs when the MySQL container starts for the first time

-- Create additional user permissions
GRANT ALL PRIVILEGES ON studymate_dev.* TO 'studymate'@'%';
FLUSH PRIVILEGES;

-- Set timezone
SET time_zone = '+00:00';

-- Create database if not exists (already handled by environment variables)
-- USE studymate_dev;
