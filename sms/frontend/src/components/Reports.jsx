import React from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, Divider, Card, CardContent, Avatar, Fade, Stack, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Assessment as AssessmentIcon, BarChart as BarChartIcon, Paid as PaidIcon, People as PeopleIcon, ReceiptLong as ReceiptLongIcon, SentimentSatisfiedAlt as SmileIcon, Download as DownloadIcon } from '@mui/icons-material';
import { fetchReports, addReport, deleteReport, getToken } from '../api';

const gradient = 'linear-gradient(135deg, #e3ecfa 0%, #f9e7f7 100%)';

const reportTypes = [
  { value: 'dues', label: 'Dues Report', description: 'Generate a report of all pending and paid dues' },
  { value: 'members', label: 'Members Report', description: 'Generate a report of all society members' },
  { value: 'complaints', label: 'Complaints Report', description: 'Generate a report of all complaints and their status' },
  { value: 'notices', label: 'Notices Report', description: 'Generate a report of all notices and their read status' }
];

const Reports = () => {
  const [reports, setReports] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [reportType, setReportType] = React.useState('');
  const [dateRange, setDateRange] = React.useState({
    start: '',
    end: ''
  });
  const [downloadError, setDownloadError] = React.useState('');

  React.useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setReportType('');
    setDateRange({ start: '', end: '' });
  };

  const handleGenerate = async () => {
    try {
      const reportData = {
        type: reportType,
        dateRange,
        generatedAt: new Date().toISOString()
      };
      
      const created = await addReport(reportData);
      setReports((prev) => [...prev, created]);
      handleClose();
    } catch (error) {
      console.error('Error generating report:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDownload = async (id) => {
    try {
      setDownloadError('');
      const response = await fetch(`/api/reports/${id}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError('Failed to download report. Please try again.');
    }
  };

  const handleDeleteReport = async (id) => {
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AssessmentIcon />
        </Avatar>
        <Typography variant="h5" fontWeight={700}>Reports & Analytics</Typography>
      </Stack>
      <Grid container spacing={3}>
        {reports.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <SmileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No reports found.
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpen}>Generate Report</Button>
            </Box>
          </Grid>
        ) : (
          reports.map((report, idx) => (
            <Grid item xs={12} md={6} key={report.id}>
              <Fade in timeout={600} style={{ transitionDelay: `${idx * 100}ms` }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)', mb: 2, border: '2px solid', borderImage: 'linear-gradient(135deg, #6a93f8 0%, #f857a6 100%) 1', background: gradient, transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: '0 8px 32px 0 rgba(80,80,200,0.18)', transform: 'scale(1.03)' } }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', mr: 2 }}>
                      {report.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} color="primary.main">{report.title}</Typography>
                      <Divider sx={{ my: 1, width: 60 }} />
                      <Typography variant="body2" color="text.secondary">{report.description}</Typography>
                    </Box>
                    <Tooltip title={`Download ${report.title}`}>
                      <IconButton color="primary" sx={{ ml: 1 }} onClick={() => handleDownload(report.id)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))
        )}
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>All Reports</Typography>
        <Button variant="contained" onClick={handleOpen}>Generate New Report</Button>
      </Box>
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)' }}>
        <List>
          {reports.length === 0 ? (
            <ListItem>
              <ListItemText primary={<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}><SmileIcon color="primary" sx={{ fontSize: 32, mb: 1 }} /><Typography variant="body2" color="text.secondary">No reports found.</Typography></Box>} />
            </ListItem>
          ) : (
            reports.map((report, idx) => (
              <ListItem key={report.id} divider secondaryAction={
                <Tooltip title={`Download ${report.title}`}>
                  <IconButton color="primary" onClick={() => handleDownload(report.id)}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              }>
                <ListItemText primary={report.title} secondary={report.description} />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {downloadError && (
        <Typography color="error" sx={{ mt: 2, mb: 2, fontWeight: 600, fontSize: 16 }}>
          {downloadError}
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Generate New Report</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            fullWidth
            required
          >
            {reportTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {reportType && (
            <Typography variant="body2" color="text.secondary">
              {reportTypes.find(t => t.value === reportType)?.description}
            </Typography>
          )}
          <TextField
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleGenerate} 
            variant="contained"
            disabled={!reportType || !dateRange.start || !dateRange.end}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;