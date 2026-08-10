import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { FolderGit2, Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/projects/ProjectForm';

// Dummy data — follows API contract: GET /projects?status=&search=
// Fields per DATABASE_SCHEMA.md: title, description, teamId, status, deadline
const DUMMY_PROJECTS = [
  {
    id: 'p1',
    title: 'LMS Web App',
    description: 'Full-stack learning management system for Saylani bootcamp.',
    team: 'Team Alpha',
    teamId: 't1',
    status: 'active',
    deadline: '2026-10-15',
    taskCount: 5,
    completedTasks: 2,
  },
  {
    id: 'p2',
    title: 'E-commerce API',
    description: 'REST API backend for an online storefront with cart and payments.',
    team: 'Team Beta',
    teamId: 't2',
    status: 'active',
    deadline: '2026-09-30',
    taskCount: 8,
    completedTasks: 3,
  },
  {
    id: 'p3',
    title: 'Portfolio Generator',
    description: 'Auto-generates developer portfolios from GitHub profiles.',
    team: 'Team Gamma',
    teamId: 't3',
    status: 'completed',
    deadline: '2026-08-01',
    taskCount: 6,
    completedTasks: 6,
  },
  {
    id: 'p4',
    title: 'AI Analytics Dashboard',
    description: 'Business intelligence dashboard powered by ML analytics.',
    team: 'Team Alpha',
    teamId: 't1',
    status: 'on-hold',
    deadline: '2026-12-01',
    taskCount: 4,
    completedTasks: 0,
  },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Client-side filter against dummy data (mirrors ?search=&status= query params)
  const filtered = DUMMY_PROJECTS.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (
      search &&
      !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !p.team.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const columns = [
    {
      accessorKey: 'title',
      header: 'PROJECT',
      cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.original.description}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'team',
      header: 'TEAM',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue() || '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'deadline',
      header: 'DEADLINE',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue() || '—'}
        </Typography>
      ),
    },
    {
      id: 'tasks',
      header: 'TASKS',
      cell: ({ row }) => (
        <Typography variant="body2" color="text.secondary">
          {row.original.completedTasks} / {row.original.taskCount}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            title="View project"
            onClick={() => navigate(`/projects/${row.original.id}`)}
          >
            <Eye size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            title="Edit project"
            onClick={() => {
              setEditingProject(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            title="Delete project"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSave = async (data) => {
    // Stub — will be replaced with POST /projects or PUT /projects/:id on Day 5
    await new Promise((r) => setTimeout(r, 400));
    toast.success(editingProject ? 'Project updated successfully' : 'Project created successfully');
  };

  const handleDelete = async () => {
    // Stub — will be replaced with DELETE /projects/:id on Day 5
    await new Promise((r) => setTimeout(r, 400));
    toast.success('Project deleted successfully');
    setDeleteId(null);
  };

  const totalPages = Math.ceil(filtered.length / 10);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Capstones &amp; Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track team deliverables, task milestones, and sprint progress.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          disableElevation
          onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
          }}
        >
          Add Project
        </Button>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SearchBar value={search} onChange={setSearch} placeholder="Search project or team..." />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FilterBar
            label="All Statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        data={filtered}
        columns={columns}
        emptyMessage="No projects found"
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        onChange={setPage}
      />

      {/* Add / Edit Modal */}
      <ProjectForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        initialData={editingProject}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will also be removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
