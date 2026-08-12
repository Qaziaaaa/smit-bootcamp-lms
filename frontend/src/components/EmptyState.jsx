import { Box, Stack, Typography } from '@mui/material';
import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No records found.' }) => (
  <Stack
    spacing={1}
    alignItems="center"
    justifyContent="center"
    sx={{ py: 6, color: 'text.secondary' }}
    data-testid="empty-state"
  >
    <Inbox size={40} />
    <Typography variant="body1">{message}</Typography>
    <Box />
  </Stack>
);

export default EmptyState;
