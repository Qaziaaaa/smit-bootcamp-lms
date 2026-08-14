import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Modal } from '../ui/Modal';

const adminSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profileImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const emptyValues = { name: '', email: '', phone: '', password: '', profileImage: '' };

export const AdminForm = ({ open, onClose, onSubmit }) => {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(emptyValues);
      setErrors({});
      setShowPassword(false);
    }
  }, [open]);

  const setField = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = adminSchema.safeParse(values);
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
      await onSubmit(result.data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Admin" hideDividers>
      <form onSubmit={handleSubmit}>
        <p className="mb-6 text-sm text-muted-foreground">
          Add a new admin to the LMS platform. (Stored locally for now).
        </p>

        <div className="space-y-5">
          <FormField
            label="Full Name"
            name="name"
            value={values.name}
            onChange={setField('name')}
            error={errors.name}
            required
            placeholder="e.g. John Doe"
          />
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={setField('email')}
            error={errors.email}
            required
            placeholder="admin@saylani.org"
          />
          <FormField
            label="Phone Number"
            name="phone"
            value={values.phone}
            onChange={setField('phone')}
            error={errors.phone}
            required
            placeholder="e.g. 0300 1234567"
          />
          <FormField
            label="Profile Picture URL"
            name="profileImage"
            value={values.profileImage}
            onChange={setField('profileImage')}
            error={errors.profileImage}
            placeholder="https://example.com/image.png"
          />
          <div className="space-y-1.5">
            <Label htmlFor="password">
              Password
              <span className="text-destructive"> *</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={setField('password')}
                placeholder="Min. 8 characters"
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
            {isSubmitting ? 'Creating...' : 'Create Admin'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
