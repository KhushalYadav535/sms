import React from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, Divider, Card, CardContent, Avatar, Fade, Stack, IconButton, Tooltip, Button } from '@mui/material';
import { Assessment as AssessmentIcon, BarChart as BarChartIcon, Paid as PaidIcon, People as PeopleIcon, ReceiptLong as ReceiptLongIcon, SentimentSatisfiedAlt as SmileIcon, Download as DownloadIcon } from '@mui/icons-material';
import { fetchReports, addReport, deleteReport } from '../api';

const gradient = 'linear-gradient(135deg, #e3ecfa 0%, #f9e7f7 100%)';

const Reports = () => {
  const [reports, setReports] = React.useState([]);
  React.useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const handleDownload = (key) => {
    // TODO: Call API to download/export report
  };

  const handleAddReport = async (data) => {
    const created = await addReport(data);
    setReports((prev) => [...prev, created]);
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
              <Button variant="contained" sx={{ mt: 2 }}>Generate Report</Button>
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
                      <IconButton color="primary" sx={{ ml: 1 }} onClick={() => handleDownload(report.title.toLowerCase().replace(/\s+/g, '-'))}>
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
      <Typography variant="h6" fontWeight={700} mb={2}>All Reports</Typography>
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(80,80,200,0.08)' }}>
        <List>
          {reports.length === 0 ? (
            <ListItem>
              <ListItemText primary={<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}><SmileIcon color="primary" sx={{ fontSize: 32, mb: 1 }} /><Typography variant="body2" color="text.secondary">No reports found.</Typography><Button variant="contained" sx={{ mt: 2 }}>Generate Report</Button></Box>} />
          </ListItem>
          ) : (
            reports.map((report, idx) => (
              <ListItem key={report.id} divider secondaryAction={
                <Tooltip title={`Download ${report.title}`}>
                  <IconButton color="primary" onClick={() => handleDownload(report.title.toLowerCase().replace(/\s+/g, '-'))}>
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
    </Box>
  );
};

export default Reports;