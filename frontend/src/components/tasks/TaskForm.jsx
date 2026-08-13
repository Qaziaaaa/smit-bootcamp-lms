import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
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
        toFormValue(initialData) || {
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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormField name="title" control={control} label="Task Title *" />
          </Grid>
          <Grid item xs={12}>
            <FormField
              name="description"
              control={control}
              label="Description"
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="projectId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth size="small" error={!!error} disabled={!!lockedProjectId}>
                  <InputLabel shrink>Project *</InputLabel>
                  <Select {...field} label="Project *" notched displayEmpty>
                    <MenuItem value=""><em>Select project</em></MenuItem>
                    {projects.map((p) => (
                      <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Assign To (Optional)</InputLabel>
                  <Select {...field} label="Assign To (Optional)" notched displayEmpty>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {students.map((s) => (
                      <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
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
          </Grid>

          <Grid item xs={12} sm={6}>
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
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField name="deadline" control={control} label="Deadline (Optional)" type="date" />
          </Grid>
        </Grid>
      </form>
    </Modal>
  );
};
