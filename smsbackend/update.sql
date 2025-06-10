-- Create security_incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('pending', 'resolved', 'urgent') NOT NULL DEFAULT 'pending',
  date DATE NOT NULL,
  reported_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Add status column to members table
ALTER TABLE members
ADD COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'active';

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(20) NOT NULL UNIQUE,
  member_id INT NOT NULL,
  flat_number VARCHAR(20) NOT NULL,
  soc_code VARCHAR(20) NOT NULL,
  bill_period DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('Pending', 'Paid', 'Overdue') NOT NULL DEFAULT 'Pending',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  payment_id INT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES accounting(id) ON DELETE SET NULL
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  soc_code VARCHAR(20) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  start_date DATE,
  end_date DATE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Add payment_id column to invoices table if it doesn't exist
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payment_id INT,
ADD FOREIGN KEY IF NOT EXISTS (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Create standard_charges table if it doesn't exist
CREATE TABLE IF NOT EXISTS standard_charges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default standard charges if they don't exist
INSERT IGNORE INTO standard_charges (description, amount) VALUES
('Maintenance', 1500.00),
('Water', 200.00),
('Electricity', 300.00),
('Parking', 500.00),
('Garbage Collection', 100.00); 