-- Migration script to add missing columns and tables

-- Add house_number column to members table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' AND column_name = 'house_number') THEN
        ALTER TABLE members ADD COLUMN house_number VARCHAR(50);
    END IF;
END $$;

-- Add status column to members table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' AND column_name = 'status') THEN
        ALTER TABLE members ADD COLUMN status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active';
    END IF;
END $$;

-- Create standard_charges table if it doesn't exist
CREATE TABLE IF NOT EXISTS standard_charges (
  charge_id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  member_id INTEGER NOT NULL,
  bill_period DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')) NOT NULL DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Add flat_number column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'flat_number') THEN
        ALTER TABLE invoices ADD COLUMN flat_number VARCHAR(50);
    END IF;
END $$;

-- Add soc_code column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'soc_code') THEN
        ALTER TABLE invoices ADD COLUMN soc_code VARCHAR(20) DEFAULT 'SOC001';
    END IF;
END $$;

-- Create invoice_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_items (
  item_id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  soc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create notices table if it doesn't exist
CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high')) NOT NULL DEFAULT 'normal',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Create triggers for updated_at if they don't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for new tables
DO $$ 
BEGIN
    -- standard_charges trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_standard_charges_updated_at') THEN
        CREATE TRIGGER update_standard_charges_updated_at BEFORE UPDATE ON standard_charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- invoices trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- settings trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
        CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- events trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
        CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- notices trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notices_updated_at') THEN
        CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- payments trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
        CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert default standard charges if they don't exist
INSERT INTO standard_charges (description, amount) VALUES
  ('Maintenance Fee', 500.00),
  ('Water Charges', 200.00),
  ('Electricity Charges', 300.00),
  ('Security Fee', 150.00),
  ('Garbage Collection', 100.00)
ON CONFLICT DO NOTHING;

-- Insert default settings if they don't exist
INSERT INTO settings (setting_key, setting_value, description) VALUES
  ('society_name', 'Housing Society', 'Name of the housing society'),
  ('society_address', '123 Society Street, City, State', 'Address of the housing society'),
  ('contact_email', 'admin@society.com', 'Primary contact email'),
  ('contact_phone', '+91-1234567890', 'Primary contact phone number'),
  ('invoice_prefix', 'INV', 'Prefix for invoice numbers'),
  ('late_fee_percentage', '5', 'Late fee percentage for overdue invoices')
ON CONFLICT (setting_key) DO NOTHING; 