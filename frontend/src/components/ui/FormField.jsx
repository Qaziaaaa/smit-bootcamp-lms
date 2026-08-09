import React from 'react';
import { Controller } from 'react-hook-form';
import { TextField, Box } from '@mui/material';

export const FormField = ({ 
  name, 
  control, 
  label, 
  type = 'text', 
  multiline = false,
  rows = 4,
  ...props 
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            {...props}
            type={type}
            label={label}
            fullWidth
            variant="outlined"
            size="small"
            error={!!error}
            helperText={error?.message}
            multiline={multiline}
            rows={multiline ? rows : undefined}
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
      />
    </Box>
  );
};
