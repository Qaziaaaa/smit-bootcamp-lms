import { Alert, Box, Button, Stack } from '@mui/material';
import { RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <Stack
    spacing={2}
    alignItems="center"
    justifyContent="center"
    sx={{ py: 6 }}
    data-testid="error-state"
  >
    <Alert severity="error" sx={{ maxWidth: 480 }}>
      {message}
    </Alert>
    {onRetry && (
      <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={onRetry}>
        Retry
      </Button>
    )}
    <Box />
  </Stack>
);

export default ErrorState;
