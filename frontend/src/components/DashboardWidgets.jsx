import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const DashboardWidgets = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
    <Box sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: 2, p: 3, boxShadow: 2 }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Funds</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>&#8377; 12,50,000</Typography>
    </Box>
    <Box sx={{ bgcolor: 'secondary.main', color: '#fff', borderRadius: 2, p: 3, boxShadow: 2 }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Pending Dues</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>&#8377; 1,20,000</Typography>
    </Box>
    <Box sx={{ bgcolor: '#fff', color: 'primary.main', borderRadius: 2, p: 3, boxShadow: 2, border: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Monthly Expenses</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>&#8377; 80,000</Typography>
    </Box>
    <Box sx={{ bgcolor: '#fff', color: 'primary.main', borderRadius: 2, p: 3, boxShadow: 2, border: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Member Complaints</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>5</Typography>
    </Box>
  </Box>
);

export default DashboardWidgets; 