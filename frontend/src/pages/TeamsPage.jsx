import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, OutlinedInput, FormHelperText, Select, MenuItem, Checkbox, ListItemText, ListSubheader, TextField } from '@mui/material';
import { Users, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTeams, createTeam, updateTeam, deleteTeam, getTeamById } from '../services/teamsService';
import { getProjects } from '../services/projectsService';
import { getStudents } from '../services/studentsService';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
  batch: z.string().optional(),
  projectId: z.string().optional(),
  members: z.array(z.string()).min(1, 'At least one team member is required'),
  leader: z.string().min(1, 'Team leader is required'),
});

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
  },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E2E8F0',
  }
};

export default function TeamsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reference data
  const [projects, setProjects] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [students, setStudents] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: '', batch: '', projectId: '', members: [], leader: '' },
  });

  const selectedMembers = useWatch({ control, name: 'members' }) || [];
  const selectedLeader = useWatch({ control, name: 'leader' });

  // Clear leader if leader is removed from members array
  useEffect(() => {
    if (selectedLeader && !selectedMembers.includes(selectedLeader)) {
      setValue('leader', '');
    }
  }, [selectedMembers, selectedLeader, setValue]);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTeams({ search });
      setTeams(result.teams || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Fetch reference data (projects, students)
  useEffect(() => {
    Promise.all([
      getProjects({ limit: 500 }),
      getStudents({ limit: 1000 })
    ])
    .then(([projRes, stuRes]) => {
      const projList = projRes.projects || [];
      setProjects(projList);
      const map = {};
      projList.forEach(p => { map[p._id] = p.title; });
      setProjectMap(map);

      const stuList = stuRes.students || [];
      setStudents(stuList);
      setBatchOptions([...new Set(stuList.map(s => s.batch).filter(Boolean))]);
    })
    .catch(err => console.error("Failed to fetch reference data:", err));
  }, []);

  const openCreate = () => {
    setEditingTeam(null);
    reset({ name: '', batch: '', projectId: '', members: [], leader: '' });
    setIsFormOpen(true);
  };

  const openEdit = async (team) => {
    setEditingTeam(team);
    reset({ name: team.name, batch: team.batch || '', projectId: team.projectId || '', members: [], leader: team.leader || '' });
    setIsFormOpen(true);

    try {
      const fullTeam = await getTeamById(team._id);
      const memberIds = (fullTeam.members || []).map(m => m._id || m.id);
      reset({ 
        name: fullTeam.name, 
        batch: fullTeam.batch || '', 
        projectId: fullTeam.project?._id || fullTeam.projectId || '', 
        members: memberIds, 
        leader: fullTeam.leader || '' 
      });
    } catch (error) {
      toast.error('Failed to load full team details');
    }
  };

  const handleSaveTeam = async (data) => {
    try {
      if (editingTeam) {
        await updateTeam(editingTeam._id, data);
        toast.success('Team updated successfully');
      } else {
        await createTeam(data);
        toast.success('Team created successfully');
      }
      setIsFormOpen(false);
      await fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save team');
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    try {
      await deleteTeam(deletingTeam._id);
      toast.success('Team deleted successfully');
      setDeletingTeam(null);
      await fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'TEAM NAME',
      cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{getValue()}</Typography>,
    },
    {
      accessorKey: 'memberCount',
      header: 'MEMBERS',
      cell: ({ getValue }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <Users size={16} />
          <Typography variant="body2">{getValue() || 0} students</Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'leader',
      header: 'TEAM LEADER',
      cell: ({ getValue }) => {
        const leaderId = getValue();
        if (!leaderId) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const leader = students.find(s => (s._id || s.id) === leaderId);
        return <Typography variant="body2">{leader ? leader.name : 'Unknown'}</Typography>;
      },
    },
    {
      accessorKey: 'projectId',
      header: 'PROJECT',
      cell: ({ getValue }) => (
        <Typography variant="body2">{getValue() ? projectMap[getValue()] || '—' : '—'}</Typography>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(`/teams/${row.original._id}`)}>
            <Eye size={18} />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => openEdit(row.original)}>
            <Edit2 size={18} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeletingTeam(row.original)}>
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Helper to render selected member names
  const renderSelectedMembers = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return <Typography sx={{ fontSize: '14px', fontStyle: 'italic', color: '#828283' }}>Select members</Typography>;
    return students
      .filter(s => selectedIds.includes(s._id || s.id))
      .map(s => s.name)
      .join(', ');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Teams</Typography>
          <Typography variant="body2" color="text.secondary">Manage student teams and project assignments.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Users size={18} />} disableElevation onClick={openCreate}>
          Add Team
        </Button>
      </Box>

      <Box sx={{
        bgcolor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '& .MuiTextField-root': {
          flex: 1,
          maxWidth: '380px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#ffffff',
            height: '44px',
          }
        }
      }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search teams..." />
      </Box>

      <DataTable data={teams} columns={columns} isLoading={loading} emptyMessage="No teams found" />
      <Pagination page={page} totalPages={1} totalItems={teams.length} onChange={setPage} />

      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Add New Team'}
        hideDividers
        actions={
          <>
            <Button onClick={() => setIsFormOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSubmit(handleSaveTeam)} color="primary" variant="contained" disableElevation>
              {editingTeam ? 'Save Changes' : 'Create Team'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleSaveTeam)}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '14px', color: '#828283' }}>
              Create a new team, assign a project, and define members and leadership.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Label>Team Name *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    fullWidth
                    placeholder="e.g. Alpha Team"
                    error={!!errors.name}
                    sx={inputStyles}
                  />
                )}
              />
              {errors.name && <FormHelperText error sx={{ ml: 0.5 }}>{errors.name.message}</FormHelperText>}
            </Box>

            <Box>
              <Label>Batch (Optional)</Label>
              <Controller
                name="batch"
                control={control}
                render={({ field }) => (
                  <Select {...field} fullWidth displayEmpty sx={inputStyles}>
                    <MenuItem value="" sx={{ fontSize: '14px', fontStyle: 'italic', color: '#828283' }}>None</MenuItem>
                    {batchOptions.map((b) => (
                      <MenuItem key={b} value={b} sx={{ fontSize: '14px' }}>{b}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Box>

            <Box>
              <Label>Project (Optional)</Label>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <Select {...field} fullWidth displayEmpty sx={inputStyles}>
                    <MenuItem value="" sx={{ fontSize: '14px', fontStyle: 'italic', color: '#828283' }}>None</MenuItem>
                    {projects.map((p) => (
                      <MenuItem key={p._id || p.id} value={p._id || p.id} sx={{ fontSize: '14px' }}>{p.title}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Label>Team Members *</Label>
              <Controller
                name="members"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    fullWidth
                    displayEmpty
                    error={!!errors.members}
                    sx={inputStyles}
                    renderValue={renderSelectedMembers}
                    MenuProps={{ autoFocus: false }}
                  >
                    <ListSubheader sx={{ pt: 1, pb: 1, bgcolor: '#fff' }}>
                      <TextField
                        size="small"
                        autoFocus
                        placeholder="Search students..."
                        fullWidth
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Escape') e.stopPropagation();
                        }}
                      />
                    </ListSubheader>
                    {students
                      .filter((s) => s.name.toLowerCase().includes(memberSearch.toLowerCase()) || s.email?.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map((student) => {
                      const sId = student._id || student.id;
                      return (
                        <MenuItem key={sId} value={sId} sx={{ p: 0 }}>
                          <Checkbox checked={field.value.indexOf(sId) > -1} size="small" />
                          <ListItemText primary={student.name} primaryTypographyProps={{ fontSize: '14px' }} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
              {errors.members && <FormHelperText error sx={{ ml: 0.5 }}>{errors.members.message}</FormHelperText>}
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Label>Team Leader *</Label>
              <Controller
                name="leader"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    displayEmpty
                    error={!!errors.leader}
                    disabled={selectedMembers.length === 0}
                    sx={inputStyles}
                  >
                    <MenuItem value="" sx={{ fontSize: '14px', fontStyle: 'italic', color: '#828283' }}>
                      {selectedMembers.length === 0 ? 'Select members first' : 'Select team leader'}
                    </MenuItem>
                    {students
                      .filter(s => selectedMembers.includes(s._id || s.id))
                      .map((s) => (
                        <MenuItem key={s._id || s.id} value={s._id || s.id} sx={{ fontSize: '14px' }}>
                          {s.name}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
              {errors.leader && <FormHelperText error sx={{ ml: 0.5 }}>{errors.leader.message}</FormHelperText>}
            </Box>

          </Box>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deletingTeam}
        title={deletingTeam ? `Delete Team: ${deletingTeam.name}` : 'Delete Team'}
        message="Are you sure you want to delete this team? Students will become unassigned."
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeletingTeam(null)}
      />
    </Box>
  );
}
