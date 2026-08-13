import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Users, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../services/teamsService';
import { getProjects } from '../services/projectsService';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
});

export default function TeamsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [teams, setTeams] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: '' },
  });

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

  useEffect(() => {
    getProjects({ limit: 500 })
      .then((result) => {
        const map = {};
        (result.projects || []).forEach((p) => {
          map[p._id] = p.title;
        });
        setProjectMap(map);
      })
      .catch(() => setProjectMap({}));
  }, []);

  const openCreate = () => {
    setEditingTeam(null);
    reset({ name: '' });
    setIsFormOpen(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    reset({ name: team.name });
    setIsFormOpen(true);
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
    try {
      await deleteTeam(deleteId);
      toast.success('Team deleted successfully');
      setDeleteId(null);
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
          <IconButton size="small" color="error" onClick={() => setDeleteId(row.original._id)}>
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

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

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search teams..." />
      </Box>

      <DataTable data={teams} columns={columns} isLoading={loading} emptyMessage="No teams found" />

      <Pagination page={page} totalPages={1} totalItems={teams.length} onChange={setPage} />

      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Add New Team'}
        actions={
          <>
            <Button onClick={() => setIsFormOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSubmit(handleSaveTeam)} color="primary" variant="contained" disableElevation>
              {editingTeam ? 'Save Changes' : 'Create Team'}
            </Button>
          </>
        }
      >
        <form>
          <FormField name="name" control={control} label="Team Name" />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Team"
        message="Are you sure you want to delete this team? Students will become unassigned."
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
