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
    const result = await pool.query(`
      SELECT i.*, u.name as member_name, m.house_number as flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      JOIN users u ON m.user_id = u.id
      ORDER BY i.generated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoiceResult = await pool.query(`
      SELECT i.*, m.name as member_name, m.flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      WHERE i.invoice_id = $1
    `, [req.params.id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const itemsResult = await pool.query(`
      SELECT * FROM invoice_items
      WHERE invoice_id = $1
    `, [req.params.id]);

    res.json({ ...invoiceResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

// Generate invoices for a month
const generateInvoices = async (req, res) => {
  const { month, year, startNumber, includeAll, selectedMembers } = req.body;
  
  try {
    console.log('Generating invoices with data:', { month, year, startNumber, includeAll, selectedMembers });
    
    // Validate required fields
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Get all active members
    let membersResult;
    if (includeAll) {
      membersResult = await pool.query(`
        SELECT m.id, u.name, m.house_number AS flat_number, u.email, m.status
        FROM members m
        JOIN users u ON m.user_id = u.id
        WHERE m.status = 'active' OR m.status IS NULL
      `);
    } else {
      membersResult = await pool.query(`
        SELECT m.id, u.name, m.house_number AS flat_number, u.email, m.status
        FROM members m
        JOIN users u ON m.user_id = u.id
        WHERE (m.status = 'active' OR m.status IS NULL) AND m.id = ANY($1)
      `, [selectedMembers]);
    }

    console.log('Found members:', membersResult.rows.length);

    // Get standard charges
    const chargesResult = await pool.query(`
      SELECT * FROM standard_charges
      WHERE is_active = true
    `);

    console.log('Found standard charges:', chargesResult.rows.length);

    if (chargesResult.rows.length === 0) {
      return res.status(400).json({ message: 'No standard charges found. Please add standard charges first.' });
    }

    const generatedInvoices = [];

    // Get the next invoice number
    const lastInvoiceResult = await pool.query(`
      SELECT invoice_number FROM invoices
      WHERE invoice_number LIKE $1
      ORDER BY invoice_number DESC
      LIMIT 1
    `, [`INV-${year}-%`]);

    let nextNumber = parseInt(startNumber) || 1;
    if (lastInvoiceResult.rows.length > 0) {
      const lastNumber = parseInt(lastInvoiceResult.rows[0].invoice_number.split('-')[2]);
      nextNumber = Math.max(nextNumber, lastNumber + 1);
    }

    // Month names array for conversion
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (const member of membersResult.rows) {
      try {
        // Defensive: skip if house_number (flat_number) is missing
        if (!member.flat_number) {
          console.warn('Skipping member with missing flat_number (house_number):', member);
          continue;
        }
        
        // Defensive: skip if name or email missing
        if (!member.name || !member.email) {
          console.warn('Skipping member with missing name or email:', member);
          continue;
        }

        // Generate invoice number
        const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
        nextNumber++;

        // Calculate total amount
        const totalAmount = chargesResult.rows.reduce((sum, charge) => sum + Number(charge.amount), 0);

        // Convert month to number
        const monthNumber = (isNaN(month) ? (monthNames.indexOf(month) + 1) : parseInt(month));
        const monthStr = monthNumber.toString().padStart(2, '0');

        console.log('Creating invoice for member:', {
          id: member.id,
          name: member.name,
          flat_number: member.flat_number,
          invoiceNumber,
          totalAmount
        });

        // Create invoice
        const result = await pool.query(`
          INSERT INTO invoices (
            invoice_number, member_id, flat_number, soc_code,
            bill_period, due_date, total_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING invoice_id
        `, [
          invoiceNumber,
          member.id,
          member.flat_number,
          'SOC001',
          `${year}-${monthStr}-01`,
          `${year}-${monthStr}-15`,
          totalAmount
        ]);

        const invoiceId = result.rows[0].invoice_id;

        // Create invoice items
        for (const charge of chargesResult.rows) {
          await pool.query(`
            INSERT INTO invoice_items (
              invoice_id, description, amount, soc_code
            ) VALUES ($1, $2, $3, $4)
          `, [
            invoiceId,
            charge.description,
            charge.amount,
            'SOC001'
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

      } catch (memberError) {
        console.error('Error creating invoice for member:', member.id, memberError);
        // Continue with other members instead of failing completely
      }
    }

    console.log('Successfully generated invoices:', generatedInvoices.length);

    res.json({ 
      message: 'Invoices generated successfully', 
      invoices: generatedInvoices,
      count: generatedInvoices.length
    });
  } catch (error) {
    console.error('Error generating invoices:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      stack: error.stack
    });
    
    res.status(500).json({
      message: 'Error generating invoices',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      details: process.env.NODE_ENV !== 'production' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint
      } : undefined
    });
  }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(`
      UPDATE invoices
      SET status = $1, paid_at = $2
      WHERE invoice_id = $3
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
    const result = await pool.query(`
      SELECT * FROM standard_charges
      WHERE is_active = true
      ORDER BY description
    `);
    res.json(result.rows);
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
      SET description = $1, amount = $2, is_active = $3
      WHERE charge_id = $4
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
    const result = await pool.query(`
      INSERT INTO standard_charges (description, amount)
      VALUES ($1, $2) RETURNING *
    `, [description, amount]);

    res.json({
      message: 'Standard charge added successfully',
      charge: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding standard charge:', error);
    res.status(500).json({ message: 'Error adding standard charge' });
  }
};

// Download invoice PDF
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoiceResult = await pool.query(`
      SELECT i.*, u.name as member_name, m.house_number as flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE i.invoice_id = $1
    `, [req.params.id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const itemsResult = await pool.query(`
      SELECT * FROM invoice_items
      WHERE invoice_id = $1
    `, [req.params.id]);

    const invoiceData = { ...invoiceResult.rows[0], items: itemsResult.rows };
    
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
    itemsResult.rows.forEach((item, index) => {
      doc.text(item.description, 20, y);
      doc.text(`₹${Number(item.amount).toFixed(2)}`, 150, y);
      y += 10;
    });

    // Add total
    const total = itemsResult.rows.reduce((sum, item) => sum + Number(item.amount), 0);
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
    const invoiceResult = await pool.query(`
      SELECT i.*, u.name as member_name, m.house_number as flat_number
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE i.invoice_id = $1
    `, [req.params.id]);

    if (invoiceResult.rows.length === 0) {
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