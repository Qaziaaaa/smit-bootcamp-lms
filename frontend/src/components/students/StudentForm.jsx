import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  batch: z.string().min(1, "Batch is required"),
  teamId: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
});

export const StudentForm = ({ open, onClose, onSubmit, initialData = null, teams = [] }) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      batch: '',
      teamId: '',
      password: '',
    },
  });

  // Reset form when opened with new data
  React.useEffect(() => {
    if (open) {
      reset(initialData || {
        name: '', email: '', phone: '', batch: '', teamId: '', password: '',
      });
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data) => {
    const { password, ...rest } = data;
    const payload = { ...rest, teamId: rest.teamId || undefined };
    if (!isEditing) payload.password = password;
    await onSubmit(payload);
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
      title={isEditing ? "Edit Student" : "Add Student"}
      actions={actions}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormField name="name" control={control} label="Full Name" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField name="email" control={control} label="Email Address" type="email" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField name="phone" control={control} label="Phone Number" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField name="batch" control={control} label="Batch" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="teamId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth size="small" error={!!error}>
                  <InputLabel shrink>Team (Optional)</InputLabel>
                  <Select {...field} label="Team (Optional)" notched displayEmpty>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t._id || t.id} value={t._id || t.id}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          {!isEditing && (
            <Grid item xs={12} sm={6}>
              <FormField name="password" control={control} label="Initial Password" type="password" />
            </Grid>
          )}
        </Grid>
      </form>
    </Modal>
  );
};
