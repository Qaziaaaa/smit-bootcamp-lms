import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Modal } from '../ui/Modal';
import { getNextRollNo } from '../../services/studentsService';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  rollNo: z.string().min(1, 'Roll No is required'),
});

const emptyValues = { name: '', phone: '', rollNo: '' };

export const StudentForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          name: initialData.name || '',
          phone: initialData.phone || '',
          rollNo: initialData.rollNo || initialData.rollNumber || '',
        });
      } else {
        setValues(emptyValues);
        getNextRollNo()
          .then((data) => {
            setValues((v) => ({ ...v, rollNo: data?.rollNo || '' }));
          })
          .catch(() => {});
      }
      setErrors({});
    }
  }, [open, initialData]);

  const setField = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = studentSchema.safeParse(values);
    const nextErrors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        if (!nextErrors[issue.path[0]]) nextErrors[issue.path[0]] = issue.message;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
      onClose();
    } catch (err) {
      console.error('Failed to submit student form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Student' : 'Add New Student'} hideDividers>
      <form onSubmit={handleSubmit}>
        <p className="mb-6 text-sm text-muted-foreground">
          {isEditing ? 'Update student details.' : 'Email, batch, and password are auto-assigned.'}
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Full Name"
            name="name"
            className="sm:col-span-2"
            value={values.name}
            onChange={setField('name')}
            error={errors.name}
            required
            placeholder="e.g. Ahmed Khan"
          />
          <FormField
            label="Roll No"
            name="rollNo"
            value={values.rollNo}
            onChange={setField('rollNo')}
            error={errors.rollNo}
            required
            placeholder="e.g. 011"
          />
          <FormField
            label="Phone"
            name="phone"
            value={values.phone}
            onChange={setField('phone')}
            error={errors.phone}
            placeholder="e.g. +92 300 1234567"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
