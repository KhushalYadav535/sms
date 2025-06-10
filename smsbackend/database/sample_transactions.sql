USE society_management;

-- Insert sample income transactions
INSERT INTO transactions (type, amount, description, category, date, created_by) VALUES
('income', 50000.00, 'Monthly Maintenance Collection', 'maintenance', CURDATE(), 1),
('income', 25000.00, 'Parking Fee Collection', 'parking', CURDATE(), 1),
('income', 15000.00, 'Event Hall Booking', 'facilities', CURDATE(), 1),
('income', 10000.00, 'Gym Membership', 'facilities', CURDATE(), 1),
('income', 5000.00, 'Late Fee Collection', 'fines', CURDATE(), 1);

-- Insert sample expense transactions
INSERT INTO transactions (type, amount, description, category, date, created_by) VALUES
('expense', 20000.00, 'Electricity Bill Payment', 'utilities', CURDATE(), 1),
('expense', 15000.00, 'Water Supply Bill', 'utilities', CURDATE(), 1),
('expense', 10000.00, 'Security Staff Salary', 'salary', CURDATE(), 1),
('expense', 8000.00, 'Garden Maintenance', 'maintenance', CURDATE(), 1),
('expense', 5000.00, 'Cleaning Supplies', 'maintenance', CURDATE(), 1); 