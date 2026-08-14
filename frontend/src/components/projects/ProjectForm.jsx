import { useEffect, useMemo, useState } from 'react';
import * as z from 'zod';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';

const projectSchema = z
  .object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'on-hold']).default('active'),
    deadline: z.string().optional(),
    assignmentMode: z.enum(['individual', 'team', 'everyone']).default('team'),
    teamId: z.string().optional(),
    assignedStudents: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.assignmentMode === 'team' && !data.teamId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Team is required when assigning to a team',
        path: ['teamId'],
      });
    }
    if (data.assignmentMode === 'individual' && (!data.assignedStudents || data.assignedStudents.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one student must be selected',
        path: ['assignedStudents'],
      });
    }
  });

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

const MODE_OPTIONS = [
  { value: 'individual', label: 'Individual Students' },
  { value: 'team', label: 'Team' },
  { value: 'everyone', label: 'Everyone' },
];

const emptyValues = {
  title: '',
  description: '',
  status: 'active',
  deadline: '',
  assignmentMode: 'team',
  teamId: '',
  assignedStudents: [],
};

export const ProjectForm = ({ open, onClose, onSubmit, initialData = null, teams = [], students = [] }) => {
  const isEditing = !!initialData;
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (open) {
      setValues({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'active',
        deadline: initialData?.deadline || '',
        assignmentMode: initialData?.assignmentMode || 'team',
        teamId: initialData?.teamId || '',
        assignedStudents: initialData?.assignedStudents || [],
      });
      setErrors({});
      setStudentSearch('');
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
      const { teamId, assignedStudents, ...rest } = result.data;
      await onSubmit({
        ...rest,
        teamId: result.data.assignmentMode === 'team' ? teamId : undefined,
        assignedStudents: result.data.assignmentMode === 'individual' ? assignedStudents : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const lower = studentSearch.toLowerCase();
    return students.filter((s) => {
      const roll = (s.rollNo || s.rollNumber || (s._id || s.id ? `STU-${String(s._id || s.id).slice(-4).toUpperCase()}` : '')).toLowerCase();
      const name = (s.name || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(lower) || roll.includes(lower) || email.includes(lower);
    });
  }, [students, studentSearch]);

  const studentIds = students.map((s) => s._id || s.id);
  const allSelected = studentIds.length > 0 && studentIds.every((id) => values.assignedStudents.includes(id));

  const handleSelectAll = () => {
    setValues((v) => ({
      ...v,
      assignedStudents: allSelected ? [] : studentIds,
    }));
    setErrors((err) => ({ ...err, assignedStudents: undefined }));
  };

  const toggleStudent = (id) => {
    setValues((v) => ({
      ...v,
      assignedStudents: v.assignedStudents.includes(id)
        ? v.assignedStudents.filter((x) => x !== id)
        : [...v.assignedStudents, id],
    }));
    setErrors((err) => ({ ...err, assignedStudents: undefined }));
  };

  let summaryText = 'No assignment selected';
  if (values.assignmentMode === 'individual') {
    summaryText = `Individual → ${values.assignedStudents.length} Student${values.assignedStudents.length !== 1 ? 's' : ''}`;
  } else if (values.assignmentMode === 'team') {
    const selectedTeam = teams.find((t) => (t._id || t.id) === values.teamId);
    summaryText = selectedTeam
      ? `Team → ${selectedTeam.name} — ${selectedTeam.memberCount || 0} Members`
      : 'Team → None Selected';
  } else if (values.assignmentMode === 'everyone') {
    summaryText = 'Everyone → All Students';
  }

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

          <div className="border-t pt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Assign Project To
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setField('assignmentMode')({ target: { value: m.value } })}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    values.assignmentMode === m.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {values.assignmentMode === 'individual' && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..."
                    className="h-9 bg-card pl-9"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-left text-sm font-semibold text-primary hover:bg-accent"
                >
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                  {allSelected ? 'Deselect All' : 'Select All Students'}
                </button>
                {filteredStudents.length === 0 ? (
                  <p className="px-1.5 py-2 text-sm text-muted-foreground">No students found.</p>
                ) : (
                  <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
                    {filteredStudents.map((s) => {
                      const id = s._id || s.id;
                      const checked = values.assignedStudents.includes(id);
                      const roll = s.rollNo || s.rollNumber || (id ? `STU-${String(id).slice(-4).toUpperCase()}` : '');
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleStudent(id)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-left hover:bg-accent"
                        >
                          <Checkbox checked={checked} />
                          <span className="min-w-0 flex items-center gap-1.5">
                            <span className="text-sm text-foreground">{s.name}</span>
                            {roll && (
                              <span className="text-xs font-mono font-medium text-muted-foreground">({roll})</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.assignedStudents && (
                  <p className="mt-2 text-xs font-medium text-destructive">{errors.assignedStudents}</p>
                )}
              </div>
            )}

            {values.assignmentMode === 'team' && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
                <Select
                  label="Select Team"
                  value={values.teamId}
                  onChange={(next) => setField('teamId')({ target: { value: next } })}
                  options={teams.map((t) => ({ label: t.name, value: t._id || t.id }))}
                  placeholder="Select a team..."
                  error={errors.teamId}
                />
                {values.teamId &&
                  (() => {
                    const selectedTeam = teams.find((t) => (t._id || t.id) === values.teamId);
                    const count = selectedTeam?.memberCount || 0;
                    return (
                      <p className="rounded-md bg-clr-emerald-bg px-2 py-1.5 text-[13px] font-medium text-clr-green-dark">
                        ALL {count} members of the selected team will receive this project.
                      </p>
                    );
                  })()}
              </div>
            )}

            {values.assignmentMode === 'everyone' && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="rounded-md bg-clr-blue-bg px-2 py-1.5 text-[13px] font-medium text-clr-blue-dark">
                  All bootcamp students will receive this project.
                </p>
              </div>
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
