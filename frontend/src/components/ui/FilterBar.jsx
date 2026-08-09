import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const FilterBar = ({ label, value, onChange, options = [], minWidth = 120 }) => {
  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        label={label}
        onChange={(e) => onChange && onChange(e.target.value)}
      >
        <MenuItem value="">
          <em>All</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
