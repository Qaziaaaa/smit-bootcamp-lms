import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Modal } from '../ui/Modal';
import { getNextRollNo } from '../../services/studentsService';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  rollNo: z.string().min(1, 'Roll No is required'),
  batch: z.string().min(1, 'Batch is required'),
  password: z.string().optional(),
});

const emptyValues = { name: '', email: '', phone: '', rollNo: '', batch: 'Batch 2026', password: 'student123' };

export const StudentForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const isEditing = !!initialData;
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          rollNo: initialData.rollNo || initialData.rollNumber || '',
          batch: initialData.batch || 'Batch 2026',
          password: '',
        });
      } else {
        setValues({ ...emptyValues });
        getNextRollNo()
          .then((data) => {
            setValues((v) => ({ ...v, rollNo: data?.rollNo || '' }));
          })
          .catch(() => {});
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [open, initialData]);

  const setField = (name) => (e) => {
    setValues((v) => {
      const next = { ...v, [name]: e.target.value };
      if (name === 'name' && !isEditing) {
        const base = e.target.value.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).join('').slice(0, 10);
        next.email = base ? `${base}01@lms.com` : '';
      }
      return next;
    });
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
          {isEditing ? 'Update student details.' : 'Fill in student details. Batch and password have defaults.'}
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
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={setField('email')}
            error={errors.email}
            required
            placeholder="ahmedkhan01@lms.com"
          />
          <FormField
            label="Phone"
            name="phone"
            value={values.phone}
            onChange={setField('phone')}
            error={errors.phone}
            placeholder="+92 300 1234567"
          />
          <FormField
            label="Roll No"
            name="rollNo"
            value={values.rollNo}
            onChange={setField('rollNo')}
            error={errors.rollNo}
            required
            placeholder="e.g. 001"
          />
          <FormField
            label="Batch"
            name="batch"
            value={values.batch}
            onChange={setField('batch')}
            error={errors.batch}
            required
            disabled
          />
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="password">
              {isEditing ? 'New Password' : 'Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={setField('password')}
                placeholder={isEditing ? 'Leave blank to keep current' : 'student123'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
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
