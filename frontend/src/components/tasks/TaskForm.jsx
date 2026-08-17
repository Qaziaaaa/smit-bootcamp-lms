import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { StudentSearchSelect } from '../ui/StudentSearchSelect';

const taskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in-progress', 'in_review', 'review_requested', 'completed']).default('in-progress'),
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
  { label: 'In Review ', value: 'in_review' },
  { label: 'Completed', value: 'completed' },
];

const emptyValues = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
  priority: 'medium',
  status: 'in-progress',
  deadline: '',
};

export const TaskForm = ({ open, onClose, onSubmit, initialData = null, lockedProjectId = null, projects = [], students = [] }) => {
  const isEditing = !!initialData;
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? {
              title: initialData.title || '',
              description: initialData.description || '',
              projectId: initialData.projectId?._id || initialData.projectId || lockedProjectId || '',
              assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
              priority: initialData.priority || 'medium',
              status: initialData.status || 'in-progress',
              deadline: initialData.deadline ? String(initialData.deadline).slice(0, 10) : '',
            }
          : { ...emptyValues, projectId: lockedProjectId || '' },
      );
      setErrors({});
    }
  }, [open, initialData, lockedProjectId]);

  const setField = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = taskSchema.safeParse(values);
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
      const { assignedTo, deadline, ...rest } = result.data;
      await onSubmit({
        ...rest,
        assignedTo: assignedTo || undefined,
        deadline: deadline || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Task' : 'Add Task'} hideDividers>
      <form onSubmit={handleSubmit}>
        <p className="mb-6 text-sm text-muted-foreground">
          Assign a new task to a student and track its completion.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Task Title"
            name="title"
            className="sm:col-span-2"
            value={values.title}
            onChange={setField('title')}
            error={errors.title}
            required
            placeholder="e.g. Implement Login Page"
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
            placeholder="Detailed task description..."
          />
          <Select
            label="Project"
            value={values.projectId}
            onChange={(next) => setField('projectId')({ target: { value: next } })}
            options={projects.map((p) => ({ label: p.title, value: p._id || p.id }))}
            placeholder="Select project"
            error={errors.projectId}
            disabled={!!lockedProjectId}
            required
          />
          <StudentSearchSelect
            label="Assign To (Optional)"
            value={values.assignedTo}
            onChange={(next) => setField('assignedTo')({ target: { value: next } })}
            students={students}
            placeholder="Search student by name or roll no..."
            error={errors.assignedTo}
          />
          <Select
            label="Priority"
            value={values.priority}
            onChange={(next) => setField('priority')({ target: { value: next } })}
            options={PRIORITY_OPTIONS}
            error={errors.priority}
          />
          <Select
            label="Status"
            value={values.status}
            onChange={(next) => setField('status')({ target: { value: next } })}
            options={STATUS_OPTIONS}
            error={errors.status}
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

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
