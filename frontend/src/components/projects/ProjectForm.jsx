import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';

const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  teamId: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']).default('active'),
  deadline: z.string().optional(),
});

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

export const ProjectForm = ({ open, onClose, onSubmit, initialData = null, teams = [] }) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      teamId: '',
      status: 'active',
      deadline: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        initialData || { title: '', description: '', teamId: '', status: 'active', deadline: '' }
      );
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data) => {
    const { teamId, deadline, ...rest } = data;
    await onSubmit({
      ...rest,
      teamId: teamId || undefined,
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
      title={isEditing ? 'Edit Project' : 'Add Project'}
      actions={actions}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormField name="title" control={control} label="Project Title *" />
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
              name="teamId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth size="small" error={!!error}>
                  <InputLabel shrink>Team (Optional)</InputLabel>
                  <Select {...field} label="Team (Optional)" notched displayEmpty>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t._id || t.id} value={t._id || t.id}>{t.name}</MenuItem>
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
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth size="small" error={!!error}>
                  <InputLabel shrink>Status *</InputLabel>
                  <Select {...field} label="Status *" notched>
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
