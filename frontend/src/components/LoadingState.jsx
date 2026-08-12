import { Box, Skeleton } from '@mui/material';

const LoadingState = () => (
  <Box data-testid="loading-state">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={64} sx={{ mb: 2 }} />
    ))}
  </Box>
);

export default LoadingState;
