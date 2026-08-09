import React from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { SearchX, AlertCircle } from 'lucide-react';

export const LoadingState = ({ rows = 5 }) => (
  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
    {Array.from(new Array(rows)).map((_, index) => (
      <Skeleton key={index} variant="rounded" height={60} />
    ))}
  </Box>
);

export const EmptyState = ({ message = "No data found", icon: Icon = SearchX }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 8,
      px: 3,
      textAlign: 'center',
      color: 'text.secondary'
    }}
  >
    <Icon size={48} color="inherit" style={{ marginBottom: '16px', opacity: 0.5 }} />
    <Typography variant="h6" color="text.primary" gutterBottom>
      {message}
    </Typography>
  </Box>
);

export const ErrorState = ({ message = "Something went wrong", onRetry }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 8,
      px: 3,
      textAlign: 'center',
      color: 'error.main'
    }}
  >
    <AlertCircle size={48} color="inherit" style={{ marginBottom: '16px' }} />
    <Typography variant="h6" gutterBottom>
      {message}
    </Typography>
    {onRetry && (
      <Button variant="outlined" color="primary" onClick={onRetry} sx={{ mt: 2 }}>
        Retry
      </Button>
    )}
  </Box>
);
