import React from 'react';
import { Chip } from '@mui/material';

const statusColorMap = {
  active: 'success',
  present: 'success',
  completed: 'success',
  pending: 'warning',
  'in-progress': 'info',
  absent: 'error',
  'on-hold': 'error',
  inactive: 'default',
};

export const Badge = ({ status, label, ...props }) => {
  const color = statusColorMap[status?.toLowerCase()] || 'default';
  
  return (
    <Chip 
      label={label || status} 
      color={color} 
      size="small" 
      sx={{ 
        fontWeight: 500,
        textTransform: 'capitalize',
        borderRadius: '8px'
      }}
      {...props} 
    />
  );
};
