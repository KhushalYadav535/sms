const pool = require('../config/db');

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      ORDER BY p.payment_date DESC
    `);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const [payment] = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
};

// Create new payment
const createPayment = async (req, res) => {
  const { invoice_id, amount, payment_method, payment_date, status } = req.body;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // Insert payment
    const [result] = await pool.query(`
      INSERT INTO payments (
        invoice_id, amount, payment_method, payment_date, status
      ) VALUES (?, ?, ?, ?, ?)
    `, [invoice_id, amount, payment_method, payment_date, status]);

    // Update invoice status if payment is completed
    if (status === 'completed') {
      await pool.query(`
        UPDATE invoices 
        SET status = 'paid' 
        WHERE id = ?
      `, [invoice_id]);
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      id: result.insertId,
      message: 'Payment created successfully'
    });
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment' });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  const { status } = req.body;
  const paymentId = req.params.id;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // Get payment details
    const [payment] = await pool.query(
      'SELECT invoice_id FROM payments WHERE id = ?',
      [paymentId]
    );

    if (payment.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    await pool.query(
      'UPDATE payments SET status = ? WHERE id = ?',
      [status, paymentId]
    );

    // Update invoice status if payment is completed
    if (status === 'completed') {
      await pool.query(
        'UPDATE invoices SET status = ? WHERE id = ?',
        ['paid', payment[0].invoice_id]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};

// Get payments by invoice ID
const getPaymentsByInvoice = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      WHERE p.invoice_id = ?
      ORDER BY p.payment_date DESC
    `, [req.params.invoiceId]);

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments by invoice:', error);
    res.status(500).json({ message: 'Error fetching payments by invoice' });
  }
};

// Get payments by member ID
const getPaymentsByMember = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      WHERE m.id = ?
      ORDER BY p.payment_date DESC
    `, [req.params.memberId]);

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments by member:', error);
    res.status(500).json({ message: 'Error fetching payments by member' });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentsByInvoice,
  getPaymentsByMember
}; 