import { useCallback, useEffect, useState } from 'react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/projects/ProjectForm';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectsService';
import { getTeams } from '../services/teamsService';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

const STATUS_CYCLE = ['active', 'completed', 'on-hold'];

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [teams, setTeams] = useState([]);
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
  }, []);

  const columns = [
    {
      accessorKey: 'title',
      header: 'PROJECT',
      cell: ({ row }) => (
        <div className="min-w-[160px]">
          <p className="text-sm font-semibold text-foreground">{row.original.title}</p>
          <p className="max-w-[260px] truncate text-xs text-muted-foreground">{row.original.description || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: 'teamId',
      header: 'TEAM',
      cell: ({ getValue }) => (
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          {getValue()?.name || '—'}
        </p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ row }) => {
        const current = row.original.status;
        const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
        return (
          <div className="whitespace-nowrap">
            <button
              onClick={async () => {
                try {
                  await updateProject(row.original._id, { status: nextStatus });
                  toast.success(`Status changed to ${nextStatus}`);
                  fetchProjects();
                } catch {
                  toast.error('Failed to update status');
                }
              }}
              className="cursor-pointer rounded-full border-0 bg-transparent p-0"
              title={`Click to change to ${nextStatus}`}
            >
              <Badge status={current} />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'deadline',
      header: 'DEADLINE',
      cell: ({ getValue }) => (
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          {getValue() ? String(getValue()).slice(0, 10) : '—'}
        </p>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="View project"
            onClick={() => navigate(`/projects/${row.original._id}`)}
          >
            <Eye size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-clr-blue"
            title="Edit project"
            onClick={() => {
              setEditingProject(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            title="Delete project"
            onClick={() => setDeleteId(row.original._id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
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
    <div className="flex flex-col gap-3 p-3">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Capstones &amp; Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Track team deliverables, task milestones, and sprint progress.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} />
          Add Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-2.5 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search project..." className="w-full sm:max-w-xs" />
        <div className="flex w-full min-w-0 items-center sm:ml-auto sm:w-auto">
          <div className="w-full min-w-0 sm:w-auto sm:min-w-[160px]">
            <Select
              value={statusFilter}
              onChange={(next) => { setStatusFilter(next); setPage(1); }}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={projects}
        columns={columns}
        isLoading={loading}
        emptyMessage="No projects found"
      />

      <Pagination
        page={page}
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
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will also be removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
