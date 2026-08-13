import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Box, Typography, OutlinedInput, Select, MenuItem, FormHelperText } from '@mui/material';
import { Modal } from '../ui/Modal';

const taskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in-progress', 'review_requested', 'completed']).default('in-progress'),
  deadline: z.string().optional(),
});

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Review Requested', value: 'review_requested' },
  { label: 'Completed', value: 'completed' },
];

const Label = ({ children }) => (
  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#828283', textTransform: 'uppercase', mb: 0.5 }}>
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
  },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E2E8F0',
  }
};

function toFormValue(initialData) {
  if (!initialData) return null;
  return {
    ...initialData,
    projectId: initialData.projectId?._id || initialData.projectId || '',
    assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
    deadline: initialData.deadline ? String(initialData.deadline).slice(0, 10) : '',
  };
}

export const TaskForm = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  lockedProjectId = null,
  projects = [],
  students = [],
}) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: lockedProjectId || '',
      assignedTo: '',
      priority: 'medium',
      status: 'in-progress',
      deadline: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        toFormValue(initialData) || {
          title: '',
          description: '',
          projectId: lockedProjectId || '',
          assignedTo: '',
          priority: 'medium',
          status: 'in-progress',
          deadline: '',
        }
      );
    }
  }, [open, initialData, lockedProjectId, reset]);

  const onFormSubmit = async (data) => {
    const { assignedTo, deadline, ...rest } = data;
    await onSubmit({
      ...rest,
      assignedTo: assignedTo || undefined,
      deadline: deadline || undefined,
    });
    onClose();
  };

  const actions = (
    <>
      <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={handleSubmit(onFormSubmit)}
        color="primary"
        variant="contained"
        disabled={isSubmitting}
        disableElevation
      >
        {isSubmitting ? 'Saving...' : 'Save Task'}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Add Task'}
      actions={actions}
      hideDividers
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '14px', color: '#828283' }}>
            Assign a new task to a student and track its completion.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Label>Task Title *</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  fullWidth
                  placeholder="e.g. Implement Login Page"
                  error={!!errors.title}
                  sx={inputStyles}
                />
              )}
            />
            {errors.title && <FormHelperText error sx={{ ml: 0.5 }}>{errors.title.message}</FormHelperText>}
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Label>Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Detailed task description..."
                  error={!!errors.description}
                  sx={inputStyles}
                />
              )}
            />
            {errors.description && <FormHelperText error sx={{ ml: 0.5 }}>{errors.description.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Project *</Label>
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  displayEmpty
                  disabled={!!lockedProjectId}
                  error={!!errors.projectId}
                  sx={inputStyles}
                >
                  <MenuItem value="" sx={{ fontSize: '14px', fontStyle: 'italic', color: '#828283' }}>Select project</MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p._id || p.id} value={p._id || p.id} sx={{ fontSize: '14px' }}>{p.title}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.projectId && <FormHelperText error sx={{ ml: 0.5 }}>{errors.projectId.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Assign To (Optional)</Label>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  displayEmpty
                  error={!!errors.assignedTo}
                  sx={inputStyles}
                >
                  <MenuItem value="" sx={{ fontSize: '14px', fontStyle: 'italic', color: '#828283' }}>Unassigned</MenuItem>
                  {students.map((s) => (
                    <MenuItem key={s._id || s.id} value={s._id || s.id} sx={{ fontSize: '14px' }}>{s.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.assignedTo && <FormHelperText error sx={{ ml: 0.5 }}>{errors.assignedTo.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Priority</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  error={!!errors.priority}
                  sx={inputStyles}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ fontSize: '14px' }}>{o.label}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.priority && <FormHelperText error sx={{ ml: 0.5 }}>{errors.priority.message}</FormHelperText>}
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
                  {STATUS_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ fontSize: '14px' }}>{o.label}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.status && <FormHelperText error sx={{ ml: 0.5 }}>{errors.status.message}</FormHelperText>}
          </Box>

          <Box>
            <Label>Deadline (Optional)</Label>
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  type="date"
                  fullWidth
                  error={!!errors.deadline}
                  sx={inputStyles}
                />
              )}
            />
            {errors.deadline && <FormHelperText error sx={{ ml: 0.5 }}>{errors.deadline.message}</FormHelperText>}
          </Box>
        </Box>
      </form>
    </Modal>
  );
};
