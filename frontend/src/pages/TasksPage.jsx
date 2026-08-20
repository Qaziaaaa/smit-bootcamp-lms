import { useCallback, useEffect, useState } from 'react';
import { Edit2, Trash2, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TaskForm } from '../components/tasks/TaskForm';
import { getTasks, createTask, updateTask, deleteTask } from '../services/tasksService';
import { getProjects } from '../services/projectsService';
import { getStudents } from '../services/studentsService';

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Completed', value: 'completed' },
];

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [page, setPage] = useState(1);

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (projectFilter) params.projectId = projectFilter;
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;
      const result = await getTasks(params);
      setTasks(result.tasks || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, projectFilter, statusFilter, assignedFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    getProjects({ limit: 500 })
      .then((result) => setProjects(result.projects || []))
      .catch(() => setProjects([]));
    getStudents({ limit: 500 })
      .then((result) => setStudents(result.students || []))
      .catch(() => setStudents([]));
  }, []);

  const assignedOptions = [...new Map(
    students
      .map((s) => [s._id, { label: s.rollNo ? `${s.name} (${s.rollNo})` : s.name, value: s._id }])
  ).values()];

  const columns = [
    {
      accessorKey: 'title',
      header: 'TASK',
      cell: ({ getValue }) => (
        <p className="min-w-[140px] text-sm font-semibold text-foreground">{getValue()}</p>
      ),
    },
    {
      accessorKey: 'projectId',
      header: 'PROJECT',
      cell: ({ getValue }) => (
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          {getValue()?.title || '—'}
        </p>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'ASSIGNED TO',
      cell: ({ getValue }) => {
        const student = getValue();
        if (!student) return <p className="whitespace-nowrap text-sm text-muted-foreground">—</p>;
        return (
          <div className="flex flex-col min-w-[120px] whitespace-nowrap">
            <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
            {student.rollNo && (
              <span className="text-[11px] font-mono text-muted-foreground">{student.rollNo}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: 'PRIORITY',
      cell: ({ getValue }) => (
        <div className="whitespace-nowrap">
          <Badge status={getValue()} label={getValue()} />
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => (
        <div className="whitespace-nowrap">
          <Badge status={getValue()} />
        </div>
      ),
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
          {row.original.status !== 'completed' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-clr-green"
              title="Mark as Completed"
              onClick={async () => {
                try {
                  await updateTask(row.original._id, { status: 'completed' });
                  toast.success('Task marked as completed');
                  fetchTasks();
                } catch {
                  toast.error('Failed to complete task');
                }
              }}
            >
              <CheckCircle size={18} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-clr-blue"
            title="Edit task"
            onClick={() => {
              setEditingTask(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            title="Delete task"
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
      if (editingTask) {
        await updateTask(editingTask._id, data);
        toast.success('Task updated successfully');
      } else {
        await createTask(data);
        toast.success('Task created successfully');
      }
      await fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleteId);
      toast.success('Task deleted successfully');
      setDeleteId(null);
      await fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Task Assignments
          </h1>
          <p className="text-sm text-muted-foreground">
            Assign sprint tasks, track progress, and evaluate student submissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={18} />
            Add Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-2.5 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search task..." className="w-full sm:max-w-xs" />
        <div className="grid w-full grid-cols-1 gap-2 sm:ml-auto sm:flex sm:w-auto sm:flex-wrap sm:grid-cols-none">
          <div className="w-full min-w-0 sm:w-auto sm:min-w-[150px]">
            <Select
              value={projectFilter}
              onChange={(next) => setProjectFilter(next)}
              options={projects.map((p) => ({ label: p.title, value: p._id }))}
              placeholder="All Projects"
            />
          </div>
          <div className="w-full min-w-0 sm:w-auto sm:min-w-[150px]">
            <Select
              value={statusFilter}
              onChange={(next) => setStatusFilter(next)}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>
          <div className="w-full min-w-0 sm:w-auto sm:min-w-[150px]">
            <Select
              value={assignedFilter}
              onChange={(next) => setAssignedFilter(next)}
              options={assignedOptions}
              placeholder="All Assignees"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tasks}
        columns={columns}
        isLoading={loading}
        emptyMessage="No tasks found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        onChange={setPage}
      />

      {/* Add / Edit Modal */}
      <TaskForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSave}
        initialData={editingTask}
        projects={projects}
        students={students}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
