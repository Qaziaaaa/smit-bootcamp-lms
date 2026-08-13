import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Button, Box, Typography, OutlinedInput, FormHelperText, 
  Select, MenuItem, Chip
} from '@mui/material';
import { Modal } from '../ui/Modal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const scheduleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  activeDays: z.array(z.string()).min(1, "Select at least one day"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export const ScheduleForm = ({ open, onClose, onSubmit, defaultValues = null }) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: defaultValues || {
      name: '',
      activeDays: [],
      startTime: '',
      endTime: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues || {
        name: '',
        activeDays: [],
        startTime: '',
        endTime: '',
      });
    }
  }, [open, reset, defaultValues]);

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
          '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFA' }
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
          '&:hover': { bgcolor: '#0E3B9A' },
        }}
      >
        {isSubmitting ? 'Saving...' : defaultValues ? 'Update Schedule' : 'Create Schedule'}
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
      title={defaultValues ? 'Edit Schedule' : 'Create New Schedule'}
      actions={actions}
      hideDividers
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '14px', color: '#828283' }}>
            {defaultValues ? 'Modify the class schedule.' : 'Define a new class schedule for the bootcamp.'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
          <Box>
            <Label>Schedule Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <OutlinedInput {...field} fullWidth placeholder="e.g. Agentic AI Weekend Batch" error={!!errors.name} sx={inputStyles} />
              )}
            />
            {errors.name && <FormHelperText error sx={{ ml: 0.5 }}>{errors.name.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Active Days</Label>
            <Controller
              name="activeDays"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  fullWidth
                  displayEmpty
                  error={!!errors.activeDays}
                  sx={inputStyles}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length === 0 && <Typography sx={{ color: '#828283', fontSize: 14 }}>Select days...</Typography>}
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.activeDays && <FormHelperText error sx={{ ml: 0.5 }}>{errors.activeDays.message}</FormHelperText>}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <Box>
              <Label>Start Time</Label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <OutlinedInput {...field} type="time" fullWidth error={!!errors.startTime} sx={inputStyles} />
                )}
              />
              {errors.startTime && <FormHelperText error sx={{ ml: 0.5 }}>{errors.startTime.message}</FormHelperText>}
            </Box>

            <Box>
              <Label>End Time</Label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <OutlinedInput {...field} type="time" fullWidth error={!!errors.endTime} sx={inputStyles} />
                )}
              />
              {errors.endTime && <FormHelperText error sx={{ ml: 0.5 }}>{errors.endTime.message}</FormHelperText>}
            </Box>
          </Box>
        </Box>
      </form>
    </Modal>
  );
};
