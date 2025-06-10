const reportsModel = require('../models/reportsModel');

// Generate financial report
const generateFinancialReport = async (req, res) => {
  try {
    console.log('Generating financial report:', { startDate: req.query.startDate, endDate: req.query.endDate });
    const report = await reportsModel.generateFinancialReport(req.query.startDate, req.query.endDate);
    console.log('Financial report generated successfully');
    res.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
};

// Generate member dues report
const generateMemberDuesReport = async (req, res) => {
  try {
    console.log('Generating member dues report');
    const report = await reportsModel.generateMemberDuesReport();
    console.log('Member dues report generated successfully');
    res.json(report);
  } catch (error) {
    console.error('Error generating member dues report:', error);
    res.status(500).json({ error: 'Failed to generate member dues report' });
  }
};

// Generate complaints report
const generateComplaintsReport = async (req, res) => {
  try {
    console.log('Generating complaints report:', { startDate: req.query.startDate, endDate: req.query.endDate });
    const report = await reportsModel.generateComplaintsReport(req.query.startDate, req.query.endDate);
    console.log('Complaints report generated successfully');
    res.json(report);
  } catch (error) {
    console.error('Error generating complaints report:', error);
    res.status(500).json({ error: 'Failed to generate complaints report' });
  }
};

// Generate notices report
const generateNoticesReport = async (req, res) => {
  try {
    console.log('Generating notices report:', { startDate: req.query.startDate, endDate: req.query.endDate });
    const report = await reportsModel.generateNoticesReport(req.query.startDate, req.query.endDate);
    console.log('Notices report generated successfully');
    res.json(report);
  } catch (error) {
    console.error('Error generating notices report:', error);
    res.status(500).json({ error: 'Failed to generate notices report' });
  }
};

module.exports = {
  generateFinancialReport,
  generateMemberDuesReport,
  generateComplaintsReport,
  generateNoticesReport
}; 