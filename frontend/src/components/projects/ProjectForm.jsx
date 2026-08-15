import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';

const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']).default('active'),
  deadline: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
});

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

const emptyValues = {
  title: '',
  description: '',
  status: 'active',
  deadline: '',
  teamId: '',
};

export const ProjectForm = ({ open, onClose, onSubmit, initialData = null, teams = [] }) => {
  const isEditing = !!initialData;
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'active',
        deadline: initialData?.deadline || '',
        teamId: initialData?.teamId?._id || initialData?.teamId || '',
      });
      setErrors({});
    }
  }, [open, initialData]);

  const setField = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = projectSchema.safeParse(values);
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

  const selectedTeam = teams.find((t) => (t._id || t.id) === values.teamId);
  const summaryText = selectedTeam
    ? `Team → ${selectedTeam.name} — ${selectedTeam.memberCount || 0} Members`
    : 'Team → None Selected';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Add Project'}
      maxWidth="sm"
      hideDividers
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Project Title"
              name="title"
              className="sm:col-span-2"
              value={values.title}
              onChange={setField('title')}
              error={errors.title}
              required
              placeholder="e.g. Website Redesign"
            />
            <FormField
              label="Description"
              name="description"
              className="sm:col-span-2"
              multiline
              rows={3}
              value={values.description}
              onChange={setField('description')}
              error={errors.description}
              placeholder="Brief description of the project"
            />
            <Select
              label="Status"
              value={values.status}
              onChange={(next) => setField('status')({ target: { value: next } })}
              options={STATUS_OPTIONS}
              error={errors.status}
              required
            />
            <FormField
              label="Deadline (Optional)"
              name="deadline"
              type="date"
              value={values.deadline}
              onChange={setField('deadline')}
              error={errors.deadline}
            />
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <Select
              label="Assign Project To Team"
              value={values.teamId}
              onChange={(next) => setField('teamId')({ target: { value: next } })}
              options={teams.map((t) => ({ label: t.name, value: t._id || t.id }))}
              placeholder="Select a team..."
              error={errors.teamId}
              required
            />
            {values.teamId && (
              <p className="rounded-md bg-clr-emerald-bg px-2 py-1.5 text-[13px] font-medium text-clr-green-dark">
                ALL {selectedTeam?.memberCount || 0} members of the selected team will receive this project.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
          <span className="inline-block rounded bg-clr-blue-bg px-2 py-1 text-xs font-semibold text-clr-blue-dark">
            {summaryText}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
