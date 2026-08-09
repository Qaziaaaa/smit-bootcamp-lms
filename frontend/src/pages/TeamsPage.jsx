import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Users, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const DUMMY_TEAMS = [
  { id: '1', name: 'Team Alpha', members: 5, project: 'LMS Web App', status: 'active' },
  { id: '2', name: 'Team Beta', members: 4, project: 'E-commerce API', status: 'active' },
  { id: '3', name: 'Team Gamma', members: 6, project: 'Portfolio Generator', status: 'completed' },
];

const teamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  project: z.string().optional(),
});

export default function TeamsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: '', project: '' },
  });

  const filteredTeams = DUMMY_TEAMS.filter(t => 
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveTeam = async (data) => {
    await new Promise(r => setTimeout(r, 500));
    toast.success("Team created successfully");
    setIsFormOpen(false);
    reset();
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'TEAM NAME',
      cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{getValue()}</Typography>,
    },
    {
      accessorKey: 'members',
      header: 'MEMBERS',
      cell: ({ getValue }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <Users size={16} />
          <Typography variant="body2">{getValue()} students</Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'project',
      header: 'PROJECT',
      cell: ({ getValue }) => <Typography variant="body2">{getValue()}</Typography>,
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(`/teams/${row.original.id}`)}>
            <Eye size={18} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteId(row.original.id)}>
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
        <Button variant="contained" startIcon={<Users size={18} />} disableElevation onClick={() => setIsFormOpen(true)}>
          Add Team
        </Button>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search teams..." />
      </Box>

      <DataTable data={filteredTeams} columns={columns} />

      <Pagination page={page} totalPages={1} totalItems={filteredTeams.length} onChange={setPage} />

      <Modal 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Add New Team"
        actions={
          <>
            <Button onClick={() => setIsFormOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSubmit(handleSaveTeam)} color="primary" variant="contained" disableElevation>Create Team</Button>
          </>
        }
      >
        <form>
          <FormField name="name" control={control} label="Team Name" />
          <FormField name="project" control={control} label="Assigned Project (Optional)" />
        </form>
      </Modal>

      <ConfirmDialog 
        open={!!deleteId} 
        title="Delete Team"
        message="Are you sure you want to delete this team? Students will become unassigned."
        onConfirm={() => { toast.success('Team deleted'); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
