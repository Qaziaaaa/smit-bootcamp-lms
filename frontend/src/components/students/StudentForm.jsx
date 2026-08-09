import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Grid2 } from '@mui/material';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  batch: z.string().min(1, "Batch is required"),
  team: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
});

export const StudentForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;
  
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      batch: '',
      team: '',
      password: '',
    },
  });

  // Reset form when opened with new data
  React.useEffect(() => {
    if (open) {
      reset(initialData || {
        name: '', email: '', phone: '', batch: '', team: '', password: '',
      });
    }
  }, [open, initialData, reset]);

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
      title={isEditing ? "Edit Student" : "Add Student"} 
      actions={actions}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Grid2 container spacing={2}>
          <Grid2 item xs={12} sm={6}>
            <FormField name="name" control={control} label="Full Name" />
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <FormField name="email" control={control} label="Email Address" type="email" />
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <FormField name="phone" control={control} label="Phone Number" />
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <FormField name="batch" control={control} label="Batch" />
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <FormField name="team" control={control} label="Team (Optional)" />
          </Grid2>
          {!isEditing && (
            <Grid2 item xs={12} sm={6}>
              <FormField name="password" control={control} label="Initial Password" type="password" />
            </Grid2>
          )}
        </Grid2>
      </form>
    </Modal>
  );
};
