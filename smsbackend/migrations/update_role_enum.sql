-- Update the role ENUM in users table
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user', 'treasure', 'security', 'secretary') NOT NULL DEFAULT 'user'; 