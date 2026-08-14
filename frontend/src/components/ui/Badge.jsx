import React from 'react';
import { Typography } from '@mui/material';

const TONE_COLORS = {
  success: { color: '#166534', bg: '#DCFCE7', border: 'rgba(22, 101, 52, 0.25)' },
  error: { color: '#B91C1C', bg: '#FEE2E2', border: 'rgba(185, 28, 28, 0.25)' },
  warning: { color: '#92400E', bg: '#FEF3C7', border: 'rgba(146, 64, 14, 0.25)' },
  info: { color: '#1E40AF', bg: '#DBEAFE', border: 'rgba(30, 64, 175, 0.25)' },
  secondary: { color: '#6B21A8', bg: '#F3E8FF', border: 'rgba(107, 33, 168, 0.25)' },
  default: { color: '#475569', bg: '#F1F5F9', border: 'rgba(71, 85, 105, 0.25)' },
};

const STATUS_TONE = {
  active: 'success',
  present: 'success',
  completed: 'success',
  low: 'success',
  pending: 'warning',
  medium: 'warning',
  'on-hold': 'warning',
  'in-progress': 'info',
  admin: 'info',
  review_requested: 'secondary',
  absent: 'error',
  high: 'error',
  inactive: 'default',
  'not-marked': 'default',
};

export const Badge = ({ status, label, icon: Icon, sx, ...props }) => {
  const key = status?.toLowerCase().replace(/[\s_]+/g, '-') ?? 'not-marked';
  const tone = TONE_COLORS[STATUS_TONE[key] || 'default'];
  const text = label || (key === 'not-marked' ? 'Not Marked' : key.replace(/-/g, ' '));

  return (
    <Typography
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.25,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
        border: '1px solid',
        borderColor: tone.border,
        bgcolor: tone.bg,
        color: tone.color,
        ...sx,
      }}
      {...props}
    >
      {Icon && <Icon size={12} />}
      {text}
    </Typography>
  );
};
