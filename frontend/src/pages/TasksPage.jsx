import { useCallback, useEffect, useState } from 'react';
import { Edit2, Trash2, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  { label: 'Review Requested', value: 'review_requested' },
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
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

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
    (tasks || [])
      .map((t) => t.assignedTo)
      .filter(Boolean)
      .map((a) => [a._id, { label: a.name, value: a._id }])
  ).values()];

  const columns = [
    {
      accessorKey: 'title',
      header: 'TASK',
      cell: ({ getValue }) => (
        <p className="text-sm font-semibold text-foreground">{getValue()}</p>
      ),
    },
    {
      accessorKey: 'projectId',
      header: 'PROJECT',
      cell: ({ getValue }) => (
        <p className="text-sm text-muted-foreground">
          {getValue()?.title || '—'}
        </p>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'ASSIGNED TO',
      cell: ({ getValue }) => (
        <p className="text-sm text-muted-foreground">
          {getValue()?.name || '—'}
        </p>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'PRIORITY',
      cell: ({ getValue }) => <Badge status={getValue()} label={getValue()} />,
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
        <p className="text-sm text-muted-foreground">
          {getValue() ? String(getValue()).slice(0, 10) : '—'}
        </p>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <div className="flex gap-1">
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

  const handleMarkAllCompleted = async () => {
    setBulkLoading(true);
    try {
      const params = { limit: 500 };
      if (search) params.search = search;
      if (projectFilter) params.projectId = projectFilter;
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;
      const result = await getTasks(params);
      const allTasks = result.tasks || [];
      const pending = allTasks.filter((t) => t.status !== 'completed');
      if (pending.length === 0) {
        toast.info('All tasks are already completed');
      } else {
        let marked = 0;
        for (const task of pending) {
          try {
            await updateTask(task._id, { status: 'completed' });
            marked += 1;
          } catch {
            // continue marking the rest; failures reported below
          }
        }
        toast.success(`${marked} of ${pending.length} task(s) marked as completed`);
      }
      setBulkConfirm(false);
      await fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark tasks completed');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3 p-3">

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
            variant="outline"
            onClick={() => setBulkConfirm(true)}
          >
            <CheckCircle size={18} />
            Mark All Completed
          </Button>
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
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search task..." />
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="w-full min-w-0 sm:w-auto sm:min-w-[160px]">
            <Select
              value={projectFilter}
              onChange={(next) => setProjectFilter(next)}
              options={projects.map((p) => ({ label: p.title, value: p._id }))}
              placeholder="All Projects"
            />
          </div>
          <div className="w-full min-w-0 sm:w-auto sm:min-w-[160px]">
            <Select
              value={statusFilter}
              onChange={(next) => setStatusFilter(next)}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>
          {assignedOptions.length > 0 && (
            <div className="w-full min-w-0 sm:w-auto sm:min-w-[160px]">
              <Select
                value={assignedFilter}
                onChange={(next) => setAssignedFilter(next)}
                options={assignedOptions}
                placeholder="All Assignees"
              />
            </div>
          )}
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

      {/* Bulk Complete Confirmation */}
      <ConfirmDialog
        open={bulkConfirm}
        title="Mark All Tasks Completed"
        message="This will mark every task in the current view as completed. This action cannot be undone. Continue?"
        confirmText="Mark All Completed"
        confirmColor="success"
        loading={bulkLoading}
        onConfirm={handleMarkAllCompleted}
        onCancel={() => setBulkConfirm(false)}
      />
    </div>
  );
}
