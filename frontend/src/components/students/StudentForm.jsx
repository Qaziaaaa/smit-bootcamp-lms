import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  rollNo: z.string().min(1, 'Roll No is required'),
  batch: z.string().min(1, 'Batch is required'),
  status: z.string().min(1, 'Status is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
});

const emptyValues = { name: '', email: '', rollNo: '', batch: '', status: 'active', password: '' };

export const StudentForm = ({ open, onClose, onSubmit, initialData = null, batchOptions = [] }) => {
  const isEditing = !!initialData;
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? {
              name: initialData.name || '',
              email: initialData.email || '',
              rollNo: initialData.rollNo || initialData.rollNumber || '',
              batch: initialData.batch || '',
              status: initialData.status || 'active',
              password: '',
            }
          : emptyValues,
      );
      setErrors({});
      setShowPassword(false);
    }
  }, [open, initialData]);

  const setField = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = studentSchema.safeParse(values);
    if (!result.success) {
      const next = {};
      for (const issue of result.error.issues) {
        if (!next[issue.path[0]]) next[issue.path[0]] = issue.message;
      }
      setErrors(next);
      return;
    }
    setIsSubmitting(true);
    try {
      const { password, ...rest } = result.data;
      const payload = { ...rest };
      if (password) payload.password = password;
      await onSubmit(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Student' : 'Add New Student'} hideDividers>
      <form onSubmit={handleSubmit}>
        <p className="mb-6 text-sm text-muted-foreground">
          Enroll a new student into the bootcamp roster with explicit batch setup.
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
            placeholder="e.g. Maya Lin"
          />
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={setField('email')}
            error={errors.email}
            required
            placeholder="maya.lin@student.dev"
          />
          <FormField
            label="Roll No"
            name="rollNo"
            value={values.rollNo}
            onChange={setField('rollNo')}
            error={errors.rollNo}
            required
            placeholder="e.g. 112 or WMA-12345"
          />
          <Select
            label="Batch"
            value={values.batch}
            onChange={(next) => setField('batch')({ target: { value: next } })}
            options={[
              ...batchOptions.map((b) => ({ label: b, value: b })),
              ...(batchOptions.length === 0 ? [{ label: 'Batch 12 - Web Dev', value: 'Batch 12 - Web Dev' }] : []),
            ]}
            placeholder="Select Batch"
            error={errors.batch}
            required
          />
          <Select
            label="Status"
            value={values.status}
            onChange={(next) => setField('status')({ target: { value: next } })}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            error={errors.status}
          />
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="password">
              {isEditing ? 'Update Password' : 'Initial Password'}
              <span className="text-destructive"> *</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={setField('password')}
                placeholder={isEditing ? 'Leave blank to keep current' : 'Min. 8 characters'}
                aria-invalid={!!errors.password}
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
            {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}
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
