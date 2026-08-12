import { Card, CardContent, Stack, Typography } from '@mui/material';

const StatCard = ({ icon, label, value, sub }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            color: 'primary.main',
            bgcolor: 'primary.light',
          }}
        >
          {icon}
        </Stack>
        <Stack minWidth={0}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" noWrap>
            {value ?? '—'}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {sub}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
