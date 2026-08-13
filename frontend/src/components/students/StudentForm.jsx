import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Box, Typography, OutlinedInput, Select, MenuItem, FormHelperText, IconButton, InputAdornment } from '@mui/material';
import { Modal } from '../ui/Modal';
import { Eye, EyeOff } from 'lucide-react';

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  rollNo: z.string().min(1, "Roll No is required"),
  batch: z.string().min(1, "Batch is required"),
  status: z.string().min(1, "Status is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
});

export const StudentForm = ({ open, onClose, onSubmit, initialData = null, batchOptions = [] }) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      rollNo: '',
      batch: '',
      status: 'active',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  React.useEffect(() => {
    if (open) {
      reset(initialData || {
        name: '', email: '', rollNo: '', batch: '', status: 'active', password: '',
      });
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data) => {
    const { password, ...rest } = data;
    const payload = { ...rest };
    if (password) {
      payload.password = password;
    }
    await onSubmit(payload);
    onClose();
  };

  const actions = (
    <>
      <Button 
        onClick={onClose} 
        disabled={isSubmitting}
        variant="outlined"
        sx={{ 
          color: '#0A0A0A', 
          borderColor: '#E2E8F0', 
          textTransform: 'none', 
          fontWeight: 600,
          px: 3,
          '&:hover': {
            borderColor: '#CBD5E1',
            bgcolor: '#F8FAFA'
          }
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit(onFormSubmit)}
        color="primary"
        variant="contained"
        disabled={isSubmitting}
        disableElevation
        sx={{ 
          bgcolor: '#2D69EB', 
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          '&:hover': { 
            bgcolor: '#0E3B9A' 
          },
        }}
      >
        {isSubmitting ? 'Saving...' : 'Save Student'}
      </Button>
    </>
  );

  const Label = ({ children }) => (
    <Typography 
      sx={{ 
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        color: '#828283',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        mb: 0.75,
        ml: 0.25
      }}
    >
      {children}
    </Typography>
  );

  const inputStyles = {
    borderRadius: '8px',
    bgcolor: '#FFFFFF',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2D69EB',
      borderWidth: '1px',
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '14px',
      color: '#0A0A0A',
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Student" : "Add New Student"}
      actions={actions}
      hideDividers
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '14px', color: '#828283' }}>
            Enroll a new student into the bootcamp roster with explicit batch setup.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Label>Full Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  fullWidth
                  placeholder="e.g. Maya Lin"
                  error={!!errors.name}
                  sx={inputStyles}
                />
              )}
            />
            {errors.name && <FormHelperText error sx={{ ml: 0.5 }}>{errors.name.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Email Address</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  type="email"
                  fullWidth
                  placeholder="maya.lin@student.dev"
                  error={!!errors.email}
                  sx={inputStyles}
                />
              )}
            />
            {errors.email && <FormHelperText error sx={{ ml: 0.5 }}>{errors.email.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Roll No</Label>
            <Controller
              name="rollNo"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  fullWidth
                  placeholder="e.g. WMA-12345"
                  error={!!errors.rollNo}
                  sx={inputStyles}
                />
              )}
            />
            {errors.rollNo && <FormHelperText error sx={{ ml: 0.5 }}>{errors.rollNo.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Batch</Label>
            <Controller
              name="batch"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  displayEmpty
                  error={!!errors.batch}
                  sx={inputStyles}
                >
                  <MenuItem value="" disabled sx={{ color: '#828283', fontSize: '14px' }}>Select Batch</MenuItem>
                  {batchOptions.map((b) => (
                    <MenuItem key={b} value={b} sx={{ fontSize: '14px' }}>{b}</MenuItem>
                  ))}
                  {batchOptions.length === 0 && <MenuItem value="Batch 12 - Web Dev" sx={{ fontSize: '14px' }}>Batch 12 - Web Dev</MenuItem>}
                </Select>
              )}
            />
            {errors.batch && <FormHelperText error sx={{ ml: 0.5 }}>{errors.batch.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  error={!!errors.status}
                  sx={inputStyles}
                >
                  <MenuItem value="active" sx={{ fontSize: '14px' }}>Active</MenuItem>
                  <MenuItem value="inactive" sx={{ fontSize: '14px' }}>Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText error sx={{ ml: 0.5 }}>{errors.status.message}</FormHelperText>}
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Label>{isEditing ? 'Update Password' : 'Initial Password'}</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder={isEditing ? "Leave blank to keep current" : "Min. 8 characters"}
                  error={!!errors.password}
                  sx={inputStyles}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                        sx={{ color: '#828283' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              )}
            />
            {errors.password && <FormHelperText error sx={{ ml: 0.5 }}>{errors.password.message}</FormHelperText>}
          </Box>
        </Box>
      </form>
    </Modal>
  );
};
