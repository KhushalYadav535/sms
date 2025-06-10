const Report = require('../models/reportModel');
const { Parser } = require('json2csv');

exports.getAll = async (req, res) => {
  try {
    const reports = await Report.getAll();
    res.json(reports);
  } catch (err) {
    console.error('Error in getAll:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, dateRange } = req.body;
    console.log('Received report data:', { type, dateRange });
    
    if (!type || !dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({ error: 'Type and date range are required' });
    }
    
    const generatedAt = new Date().toISOString();
    console.log('Attempting to create report with data:', { type, dateRange, generatedAt });
    
    const report = await Report.create({ type, dateRange, generatedAt });
    console.log('Report created successfully:', report);
    
    res.status(201).json(report);
  } catch (err) {
    console.error('Error in create report:', err);
    res.status(500).json({ error: err.message || 'Failed to create report' });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Download request for report id:', id);
    const report = await Report.getById(id);
    if (!report) {
      console.error('Report not found for id:', id);
      return res.status(404).json({ error: 'Report not found' });
    }
    console.log('Found report:', report);
    const data = await Report.generateReport(report.type, report.dateRange);
    console.log('Generated report data:', data);
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${report.type}-report-${id}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error in download report:', err);
    res.status(500).json({ error: err.message || 'Failed to download report' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.delete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in delete report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};
