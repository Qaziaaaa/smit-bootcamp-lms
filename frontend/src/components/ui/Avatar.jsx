import React from 'react';
import { Avatar as MuiAvatar } from '@mui/material';

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.length > 1 
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : `${parts[0][0]}`.toUpperCase();
};

export const Avatar = ({ name, ...props }) => {
  return (
    <MuiAvatar 
      sx={{ 
        bgcolor: name ? stringToColor(name) : 'primary.main',
        width: 40, 
        height: 40,
        fontSize: '1rem',
        fontWeight: 600
      }} 
      {...props}
    >
      {getInitials(name)}
    </MuiAvatar>
  );
};
