import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Select, MenuItem, FormControl } from '@mui/material';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/projects/ProjectForm';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectsService';
import { getTeams } from '../services/teamsService';
import { getStudents } from '../services/studentsService';

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

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const result = await getProjects(params);
      setProjects(result.projects || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    getTeams()
      .then((result) => setTeams(result.teams || []))
      .catch(() => setTeams([]));
      
    getStudents({ limit: 500 })
      .then((result) => setStudents(result.students || []))
      .catch(() => setStudents([]));
  }, []);

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
            {row.original.description || ''}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'teamId',
      header: 'TEAM',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue()?.name || '—'}
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
          {getValue() ? String(getValue()).slice(0, 10) : '—'}
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
            onClick={() => navigate(`/projects/${row.original._id}`)}
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
            onClick={() => setDeleteId(row.original._id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSave = async (data) => {
    try {
      if (editingProject) {
        await updateProject(editingProject._id, data);
        toast.success('Project updated successfully');
      } else {
        await createProject(data);
        toast.success('Project created successfully');
      }
      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteId);
      toast.success('Project deleted successfully');
      setDeleteId(null);
      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

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
        <SearchBar value={search} onChange={setSearch} placeholder="Search project..." />
        <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '44px',
                '& .MuiSelect-icon': {
                  color: '#64748B',
                }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        data={projects}
        columns={columns}
        isLoading={loading}
        emptyMessage="No projects found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        onChange={setPage}
      />

      {/* Add / Edit Modal */}
      <ProjectForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
        initialData={editingProject}
        teams={teams}
        students={students}
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
