import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Button, Box, Typography, OutlinedInput, Select, MenuItem, 
  FormHelperText, Radio, RadioGroup, FormControlLabel, 
  Checkbox, ListSubheader, InputAdornment 
} from '@mui/material';
import { Search } from 'lucide-react';
import { Modal } from '../ui/Modal';

const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']).default('active'),
  deadline: z.string().optional(),
  assignmentMode: z.enum(['individual', 'team', 'everyone']).default('team'),
  teamId: z.string().optional(),
  assignedStudents: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
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

const Label = ({ children }) => (
  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#828283', textTransform: 'uppercase', mb: 0.5 }}>
    {children}
  </Typography>
);

const inputStyles = {
  borderRadius: '8px',
  bgcolor: '#FFFFFF',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E2E8F0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#CBD5E1',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#2D69EB',
    borderWidth: '1px',
  },
  '& .MuiOutlinedInput-input': {
    fontSize: '14px',
    color: '#0A0A0A',
  }
};

export const ProjectForm = ({ open, onClose, onSubmit, initialData = null, teams = [], students = [] }) => {
  const isEditing = !!initialData;
  const [studentSearch, setStudentSearch] = useState('');

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'active',
      deadline: '',
      assignmentMode: 'team',
      teamId: '',
      assignedStudents: [],
    },
  });

  const assignmentMode = useWatch({ control, name: 'assignmentMode' });
  const teamId = useWatch({ control, name: 'teamId' });
  const assignedStudents = useWatch({ control, name: 'assignedStudents' }) || [];

  useEffect(() => {
    if (open) {
      setStudentSearch('');
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'active',
        deadline: initialData?.deadline || '',
        assignmentMode: initialData?.assignmentMode || (initialData?.teamId ? 'team' : 'team'),
        teamId: initialData?.teamId || '',
        assignedStudents: initialData?.assignedStudents || [],
      });
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data) => {
    await onSubmit({
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      deadline: data.deadline || undefined,
      assignmentMode: data.assignmentMode,
      teamId: data.assignmentMode === 'team' ? data.teamId : undefined,
      assignedStudents: data.assignmentMode === 'individual' ? data.assignedStudents : undefined,
    });
    onClose();
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const lower = studentSearch.toLowerCase();
    return students.filter(s => 
      (s.name && s.name.toLowerCase().includes(lower)) || 
      (s.email && s.email.toLowerCase().includes(lower))
    );
  }, [students, studentSearch]);

  const handleSelectAllStudents = () => {
    if (assignedStudents.length === students.length) {
      setValue('assignedStudents', []);
    } else {
      setValue('assignedStudents', students.map(s => s._id || s.id));
    }
  };

  let summaryText = 'No assignment selected';
  if (assignmentMode === 'individual') {
    summaryText = `Individual → ${assignedStudents.length} Student${assignedStudents.length !== 1 ? 's' : ''}`;
  } else if (assignmentMode === 'team') {
    const selectedTeam = teams.find(t => (t._id || t.id) === teamId);
    if (selectedTeam) {
      summaryText = `Team → ${selectedTeam.name} — ${selectedTeam.memberCount || 0} Members`;
    } else {
      summaryText = 'Team → None Selected';
    }
  } else if (assignmentMode === 'everyone') {
    summaryText = 'Everyone → All Students';
  }

  const actions = (
    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2D69EB', bgcolor: '#F0F5FF', px: 1.5, py: 0.75, borderRadius: 1, display: 'inline-block' }}>
          {summaryText}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
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
          {isSubmitting ? 'Saving...' : 'Save Project'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Add Project'}
      actions={actions}
      hideDividers
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Label>Project Title *</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    fullWidth
                    placeholder="e.g. Website Redesign"
                    error={!!errors.title}
                    sx={inputStyles}
                  />
                )}
              />
              {errors.title && <FormHelperText error sx={{ ml: 0.5 }}>{errors.title.message}</FormHelperText>}
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Label>Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Brief description of the project"
                    error={!!errors.description}
                    sx={inputStyles}
                  />
                )}
              />
              {errors.description && <FormHelperText error sx={{ ml: 0.5 }}>{errors.description.message}</FormHelperText>}
            </Box>

            <Box>
              <Label>Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    error={!!errors.status}
                    sx={inputStyles}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value} sx={{ fontSize: '14px' }}>{o.label}</MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.status && <FormHelperText error sx={{ ml: 0.5 }}>{errors.status.message}</FormHelperText>}
            </Box>

            <Box>
              <Label>Deadline (Optional)</Label>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    type="date"
                    fullWidth
                    error={!!errors.deadline}
                    sx={inputStyles}
                  />
                )}
              />
              {errors.deadline && <FormHelperText error sx={{ ml: 0.5 }}>{errors.deadline.message}</FormHelperText>}
            </Box>
          </Box>

          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
            <Label>ASSIGN PROJECT TO</Label>
            <Controller
              name="assignmentMode"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field} sx={{ mb: 2, gap: 2 }}>
                  <FormControlLabel value="individual" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '14px' }}>Individual Students</Typography>} />
                  <FormControlLabel value="team" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '14px' }}>Team</Typography>} />
                  <FormControlLabel value="everyone" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '14px' }}>Everyone</Typography>} />
                </RadioGroup>
              )}
            />

            {assignmentMode === 'individual' && (
              <Box sx={{ bgcolor: '#F8FAFA', p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Controller
                  name="assignedStudents"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      multiple
                      displayEmpty
                      fullWidth
                      sx={{ ...inputStyles, bgcolor: '#ffffff' }}
                      error={!!errors.assignedStudents}
                      renderValue={(selected) => {
                        if (selected.length === 0) return <Typography sx={{ color: '#828283', fontSize: 14 }}>Select students...</Typography>;
                        return <Typography sx={{ fontSize: 14 }}>{selected.length} Student(s) Selected</Typography>;
                      }}
                    >
                      <ListSubheader sx={{ pt: 1, pb: 1, bgcolor: '#ffffff', zIndex: 2 }}>
                        <OutlinedInput
                          size="small"
                          fullWidth
                          placeholder="Search students..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          startAdornment={<InputAdornment position="start"><Search size={16} color="#828283" /></InputAdornment>}
                          sx={{ '& .MuiOutlinedInput-input': { fontSize: '14px' } }}
                        />
                      </ListSubheader>
                      
                      <MenuItem 
                        value="all" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectAllStudents();
                        }}
                        sx={{ fontSize: '14px', fontWeight: 600, color: '#2D69EB', borderBottom: 1, borderColor: 'divider', mb: 1 }}
                      >
                        {assignedStudents.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All Students'}
                      </MenuItem>

                      {filteredStudents.length === 0 && (
                        <MenuItem disabled sx={{ fontSize: '14px' }}>No students found.</MenuItem>
                      )}
                      
                      {filteredStudents.map((s) => (
                        <MenuItem key={s._id || s.id} value={s._id || s.id} sx={{ fontSize: '14px' }}>
                          <Checkbox checked={field.value.includes(s._id || s.id)} size="small" />
                          <Box>
                            <Typography sx={{ fontSize: 14 }}>{s.name}</Typography>
                            <Typography sx={{ fontSize: 12, color: '#828283' }}>{s.email}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.assignedStudents && <FormHelperText error sx={{ mt: 1 }}>{errors.assignedStudents.message}</FormHelperText>}
              </Box>
            )}

            {assignmentMode === 'team' && (
              <Box sx={{ bgcolor: '#F8FAFA', p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Controller
                  name="teamId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      displayEmpty
                      error={!!errors.teamId}
                      sx={{ ...inputStyles, bgcolor: '#ffffff' }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: '14px', color: '#828283' }}>Select a team...</MenuItem>
                      {teams.map((t) => (
                        <MenuItem key={t._id || t.id} value={t._id || t.id} sx={{ fontSize: '14px' }}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.teamId && <FormHelperText error sx={{ mt: 1 }}>{errors.teamId.message}</FormHelperText>}
                {teamId && (() => {
                  const selectedTeam = teams.find(t => (t._id || t.id) === teamId);
                  const count = selectedTeam?.memberCount || 0;
                  return (
                    <Typography sx={{ fontSize: 13, color: '#059669', mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#ECFDF5', p: 1, borderRadius: 1 }}>
                      ALL {count} members of the selected team will receive this project.
                    </Typography>
                  );
                })()}
              </Box>
            )}

            {assignmentMode === 'everyone' && (
              <Box sx={{ bgcolor: '#F8FAFA', p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 13, color: '#2D69EB', display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F0F5FF', p: 1, borderRadius: 1 }}>
                  All bootcamp students will receive this project.
                </Typography>
              </Box>
            )}
            
          </Box>
        </Box>
      </form>
    </Modal>
  );
};
