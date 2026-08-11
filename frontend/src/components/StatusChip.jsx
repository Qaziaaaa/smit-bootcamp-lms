import { Chip } from '@mui/material';

const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  present: 'success',
  absent: 'error',
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  'on-hold': 'default',
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const StatusChip = ({ status }) => (
  <Chip
    size="small"
    label={status}
    color={STATUS_COLORS[status] || 'default'}
    sx={{ textTransform: 'capitalize' }}
  />
);

export default StatusChip;
