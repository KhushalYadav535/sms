-- Drop the existing users table
DROP TABLE IF EXISTS users;

-- Recreate the users table with proper role ENUM
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'treasure', 'security', 'secretary') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create admin user if not exists
INSERT INTO users (name, email, password, role)
SELECT 'Admin User', 'admin@society.com', '$2b$10$33OGfn44KVCNPswdBzsYPO4IdS5HdaexwK4SRsI4ZzlJzNnN6ps3G', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@society.com'); 