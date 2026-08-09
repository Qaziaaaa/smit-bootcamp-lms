import React from 'react';
import { Box, Pagination as MuiPagination, Typography } from '@mui/material';

export const Pagination = ({ 
  page, 
  totalPages, 
  onChange, 
  totalItems = 0,
  pageSize = 10 
}) => {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3 
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {totalItems > 0 ? `Showing ${startItem}–${endItem} of ${totalItems}` : 'No items to display'}
      </Typography>
      <MuiPagination 
        count={totalPages} 
        page={page} 
        onChange={(e, value) => onChange(value)} 
        color="primary" 
        shape="rounded"
      />
    </Box>
  );
};
