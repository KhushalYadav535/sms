-- First, create a temporary table with the new structure
CREATE TABLE users_new (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'treasure', 'security', 'secretary') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO users_new (id, name, email, password, role, created_at, updated_at)
SELECT id, name, email, password, role, created_at, updated_at
FROM users;

-- Drop the old table
DROP TABLE users;

-- Rename the new table to the original name
RENAME TABLE users_new TO users; 