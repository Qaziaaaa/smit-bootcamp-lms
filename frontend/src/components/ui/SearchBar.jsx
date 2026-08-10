import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = "Search...", delay = 300 }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) onChange(localValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [localValue, onChange, delay]);

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: { xs: '100%', sm: '300px' } }}
    />
  );
};
