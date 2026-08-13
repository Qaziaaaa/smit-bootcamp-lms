import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Box, Typography, OutlinedInput, FormHelperText, InputAdornment, IconButton } from '@mui/material';
import { Modal } from '../ui/Modal';
import { Eye, EyeOff } from 'lucide-react';

const adminSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profileImage: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export const AdminForm = ({ open, onClose, onSubmit }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      profileImage: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        profileImage: '',
      });
      setShowPassword(false);
    }
  }, [open, reset]);

  const onFormSubmit = async (data) => {
    await onSubmit(data);
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
        {isSubmitting ? 'Creating...' : 'Create Admin'}
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
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2D69EB', borderWidth: '1px' },
    '& .MuiOutlinedInput-input': { fontSize: '14px', color: '#0A0A0A' }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Admin"
      actions={actions}
      hideDividers
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '14px', color: '#828283' }}>
            Add a new admin to the LMS platform. (Stored locally for now).
          </Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
          <Box>
            <Label>Full Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <OutlinedInput {...field} fullWidth placeholder="e.g. John Doe" error={!!errors.name} sx={inputStyles} />
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
                <OutlinedInput {...field} type="email" fullWidth placeholder="admin@saylani.org" error={!!errors.email} sx={inputStyles} />
              )}
            />
            {errors.email && <FormHelperText error sx={{ ml: 0.5 }}>{errors.email.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Phone Number</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <OutlinedInput {...field} fullWidth placeholder="e.g. 0300 1234567" error={!!errors.phone} sx={inputStyles} />
              )}
            />
            {errors.phone && <FormHelperText error sx={{ ml: 0.5 }}>{errors.phone.message}</FormHelperText>}
          </Box>
          
          <Box>
            <Label>Profile Picture URL</Label>
            <Controller
              name="profileImage"
              control={control}
              render={({ field }) => (
                <OutlinedInput {...field} fullWidth placeholder="https://example.com/image.png" error={!!errors.profileImage} sx={inputStyles} />
              )}
            />
            {errors.profileImage && <FormHelperText error sx={{ ml: 0.5 }}>{errors.profileImage.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder="Min. 8 characters"
                  error={!!errors.password}
                  sx={inputStyles}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
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
