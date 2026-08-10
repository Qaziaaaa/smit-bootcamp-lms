import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Grid2, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';

const taskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
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
  { label: 'Completed', value: 'completed' },
];

// Dummy data — swap with real API responses on Day 5 integration
const DUMMY_PROJECTS = [
  { id: 'p1', title: 'LMS Web App' },
  { id: 'p2', title: 'E-commerce API' },
  { id: 'p3', title: 'Portfolio Generator' },
];

const DUMMY_STUDENTS = [
  { id: 's1', name: 'Maya Lin' },
  { id: 's2', name: 'John Doe' },
  { id: 's3', name: 'Sarah Smith' },
];

export const TaskForm = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  lockedProjectId = null, // When opened from ProjectDetail, project is pre-selected & locked
}) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      projectId: lockedProjectId || '',
      assignedTo: '',
      priority: 'medium',
      status: 'pending',
      deadline: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        initialData || {
          title: '',
          description: '',
          projectId: lockedProjectId || '',
          assignedTo: '',
          priority: 'medium',
          status: 'pending',
          deadline: '',
        }
      );
    }
  }, [open, initialData, lockedProjectId, reset]);

  const onFormSubmit = async (data) => {
    await onSubmit(data);
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
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Add Task'}
      actions={actions}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Grid2 container spacing={2}>
          <Grid2 item xs={12}>
            <FormField name="title" control={control} label="Task Title *" />
          </Grid2>
          <Grid2 item xs={12}>
            <FormField
              name="description"
              control={control}
              label="Description"
              multiline
              rows={3}
            />
          </Grid2>

          {/* Project selector — locked when opened from a project detail */}
          <Grid2 item xs={12} sm={6}>
            <Controller
              name="projectId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth size="small" error={!!error} disabled={!!lockedProjectId}>
                  <InputLabel shrink>Project *</InputLabel>
                  <Select {...field} label="Project *" notched displayEmpty>
                    <MenuItem value=""><em>Select project</em></MenuItem>
                    {DUMMY_PROJECTS.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid2>

          {/* Assigned student */}
          <Grid2 item xs={12} sm={6}>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Assign To (Optional)</InputLabel>
                  <Select {...field} label="Assign To (Optional)" notched displayEmpty>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {DUMMY_STUDENTS.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid2>

          {/* Priority */}
          <Grid2 item xs={12} sm={6}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Priority</InputLabel>
                  <Select {...field} label="Priority" notched>
                    {PRIORITY_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid2>

          {/* Status */}
          <Grid2 item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Status</InputLabel>
                  <Select {...field} label="Status" notched>
                    {STATUS_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid2>

          <Grid2 item xs={12} sm={6}>
            <FormField name="deadline" control={control} label="Deadline (Optional)" type="date" />
          </Grid2>
        </Grid2>
      </form>
    </Modal>
  );
};
