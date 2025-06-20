const pool = require('../config/db');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.query(`
      SELECT i.*, u.name as member_name, m.house_number as flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      JOIN users u ON m.user_id = u.id
      ORDER BY i.generated_at DESC
    `);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const [invoice] = await pool.query(`
      SELECT i.*, m.name as member_name, m.flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      WHERE i.invoice_id = ?
    `, [req.params.id]);

    if (invoice.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const [items] = await pool.query(`
      SELECT * FROM invoice_items
      WHERE invoice_id = ?
    `, [req.params.id]);

    res.json({ ...invoice[0], items });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

// Generate invoices for a month
const generateInvoices = async (req, res) => {
  const { month, year, startNumber, includeAll, selectedMembers } = req.body;
  
  try {
    // Get all active members
    const [members] = await pool.query(`
      SELECT m.id, u.name, m.house_number AS flat_number, u.email
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.status = 'active'
      ${!includeAll ? 'AND m.id IN (?)' : ''}
    `, includeAll ? [] : [selectedMembers]);

    // Get standard charges
    const [standardCharges] = await pool.query(`
      SELECT * FROM standard_charges
      WHERE is_active = true
    `);

    const generatedInvoices = [];

    // Inside generateInvoices, before the loop, add:
    const [lastInvoice] = await pool.query(`
      SELECT invoice_number FROM invoices
      WHERE invoice_number LIKE ?
      ORDER BY invoice_number DESC
      LIMIT 1
    `, [`INV-${year}-%`]);

    let nextNumber = 1;
    if (lastInvoice.length > 0) {
      const lastNumber = parseInt(lastInvoice[0].invoice_number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    for (const member of members) {
      // Generate invoice number
      const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
      nextNumber++;

      // Calculate total amount
      const totalAmount = standardCharges.reduce((sum, charge) => sum + Number(charge.amount), 0);

      // Inside generateInvoices, before using month in the date string
      const monthNumber = (isNaN(month) ? (monthNames.indexOf(month) + 1) : parseInt(month));
      const monthStr = monthNumber.toString().padStart(2, '0');

      // Create invoice
      const [result] = await pool.query(`
        INSERT INTO invoices (
          invoice_number, member_id, flat_number, soc_code,
          bill_period, due_date, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceNumber,
        member.id,
        member.flat_number,
        'SOC001', // Replace with actual society code
        `${year}-${monthStr}-01`,
        `${year}-${monthStr}-15`, // Due date is 15th of the month
        totalAmount
      ]);

      const invoiceId = result.insertId;

      // Create invoice items
      for (const charge of standardCharges) {
        await pool.query(`
          INSERT INTO invoice_items (
            invoice_id, description, amount, soc_code
          ) VALUES (?, ?, ?, ?)
        `, [
          invoiceId,
          charge.description,
          charge.amount,
          'SOC001' // Replace with actual society code
        ]);
      }

      generatedInvoices.push({
        invoiceId,
        invoiceNumber,
        memberName: member.name,
        flat: member.flat_number,
        email: member.email,
        total: totalAmount
      });
    }

    res.json({ message: 'Invoices generated successfully', invoices: generatedInvoices });
  } catch (error) {
    console.error('Error generating invoices:', error);
    res.status(500).json({ message: 'Error generating invoices' });
  }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(`
      UPDATE invoices
      SET status = ?, paid_at = ?
      WHERE invoice_id = ?
    `, [status, status === 'Paid' ? new Date() : null, req.params.id]);

    res.json({ message: 'Invoice status updated successfully' });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ message: 'Error updating invoice status' });
  }
};

// Get standard charges
const getStandardCharges = async (req, res) => {
  try {
    const [charges] = await pool.query(`
      SELECT * FROM standard_charges
      WHERE is_active = true
      ORDER BY description
    `);
    res.json(charges);
  } catch (error) {
    console.error('Error fetching standard charges:', error);
    res.status(500).json({ message: 'Error fetching standard charges' });
  }
};

// Update standard charge
const updateStandardCharge = async (req, res) => {
  const { description, amount, is_active } = req.body;
  try {
    await pool.query(`
      UPDATE standard_charges
      SET description = ?, amount = ?, is_active = ?
      WHERE charge_id = ?
    `, [description, amount, is_active, req.params.id]);

    res.json({ message: 'Standard charge updated successfully' });
  } catch (error) {
    console.error('Error updating standard charge:', error);
    res.status(500).json({ message: 'Error updating standard charge' });
  }
};

// Add new standard charge
const addStandardCharge = async (req, res) => {
  const { description, amount } = req.body;
  try {
    const [result] = await pool.query(`
      INSERT INTO standard_charges (description, amount)
      VALUES (?, ?)
    `, [description, amount]);

    res.json({
      message: 'Standard charge added successfully',
      chargeId: result.insertId
    });
  } catch (error) {
    console.error('Error adding standard charge:', error);
    res.status(500).json({ message: 'Error adding standard charge' });
  }
};

// Download invoice PDF
const downloadInvoicePDF = async (req, res) => {
  try {
    const [invoice] = await pool.query(`
      SELECT i.*, u.name as member_name, m.house_number as flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE i.invoice_id = ?
    `, [req.params.id]);

    if (invoice.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const [items] = await pool.query(`
      SELECT * FROM invoice_items
      WHERE invoice_id = ?
    `, [req.params.id]);

    const invoiceData = { ...invoice[0], items };
    
    // Generate PDF
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Housing Society Invoice', 20, 20);
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoiceData.invoice_number}`, 20, 30);
    doc.text(`Date: ${new Date(invoiceData.bill_period).toLocaleDateString()}`, 20, 40);
    doc.text(`Member: ${invoiceData.member_name}`, 20, 50);
    doc.text(`Flat: ${invoiceData.flat_number}`, 20, 60);

    // Add table header
    doc.setFontSize(12);
    doc.text('Description', 20, 80);
    doc.text('Amount', 150, 80);
    doc.line(20, 82, 190, 82);

    // Add table rows
    let y = 90;
    items.forEach((item, index) => {
      doc.text(item.description, 20, y);
      doc.text(`₹${Number(item.amount).toFixed(2)}`, 150, y);
      y += 10;
    });

    // Add total
    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
    doc.line(20, y, 190, y);
    doc.text('Total:', 20, y + 10);
    doc.text(`₹${total.toFixed(2)}`, 150, y + 10);

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceData.invoice_number}.pdf`);
    res.send(doc.output());
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

// Send invoice via email
const sendInvoiceEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const [invoice] = await pool.query(`
      SELECT i.*, u.name as member_name, m.house_number as flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE i.invoice_id = ?
    `, [req.params.id]);

    if (invoice.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // TODO: Implement email sending functionality
    // For now, just return success
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  generateInvoices,
  updateInvoiceStatus,
  getStandardCharges,
  updateStandardCharge,
  addStandardCharge,
  downloadInvoicePDF,
  sendInvoiceEmail
}; 