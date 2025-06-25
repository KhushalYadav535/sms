const pool = require('../config/db');

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(`
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
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
};

// Create new payment
const createPayment = async (req, res) => {
  const { invoice_id, amount, payment_method, payment_date, status } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Insert payment
    const result = await client.query(`
      INSERT INTO payments (
        invoice_id, amount, payment_method, payment_date, status
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [invoice_id, amount, payment_method, payment_date, status]);

    // Update invoice status if payment is completed
    if (status === 'completed') {
      await client.query(`
        UPDATE invoices 
        SET status = 'paid' 
        WHERE id = $1
      `, [invoice_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Payment created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment' });
  } finally {
    client.release();
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  const { status } = req.body;
  const paymentId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Get payment details
    const paymentResult = await client.query(
      'SELECT invoice_id FROM payments WHERE id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    await client.query(
      'UPDATE payments SET status = $1 WHERE id = $2',
      [status, paymentId]
    );

    // Update invoice status if payment is completed
    if (status === 'completed') {
      await client.query(
        'UPDATE invoices SET status = $1 WHERE id = $2',
        ['paid', paymentResult.rows[0].invoice_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  } finally {
    client.release();
  }
};

// Get payments by invoice ID
const getPaymentsByInvoice = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      WHERE p.invoice_id = $1
      ORDER BY p.payment_date DESC
    `, [req.params.invoiceId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments by invoice:', error);
    res.status(500).json({ message: 'Error fetching payments by invoice' });
  }
};

// Get payments by member ID
const getPaymentsByMember = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        i.invoice_number,
        m.name as member_name,
        m.house_number as flat_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN members m ON i.member_id = m.id
      WHERE m.id = $1
      ORDER BY p.payment_date DESC
    `, [req.params.memberId]);

    res.json(result.rows);
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