import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Edit2, Trash2, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
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
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {getValue()}
        </Typography>
      ),
    },
    {
      accessorKey: 'projectId',
      header: 'PROJECT',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue()?.title || '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'ASSIGNED TO',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue()?.name || '—'}
        </Typography>
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
          {row.original.status !== 'completed' && (
            <IconButton
              size="small"
              color="success"
              title="Mark as Completed"
              onClick={async () => {
                try {
                  await updateTask(row.original._id, { status: 'completed' });
                  toast.success('Task marked as completed');
                  fetchTasks();
                } catch (error) {
                  toast.error('Failed to complete task');
                }
              }}
            >
              <CheckCircle size={18} />
            </IconButton>
          )}
          <IconButton
            size="small"
            color="primary"
            title="Edit task"
            onClick={() => {
              setEditingTask(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            title="Delete task"
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Task Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign sprint tasks, track progress, and evaluate student submissions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CheckCircle size={18} />}
            onClick={() => setBulkConfirm(true)}
          >
            Mark All Completed
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            disableElevation
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            Add Task
          </Button>
        </Box>
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search task..." />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FilterBar
            label="All Projects"
            value={projectFilter}
            onChange={setProjectFilter}
            options={projects.map((p) => ({ label: p.title, value: p._id }))}
          />
          <FilterBar
            label="All Statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          {assignedOptions.length > 0 && (
            <FilterBar
              label="All Assignees"
              value={assignedFilter}
              onChange={setAssignedFilter}
              options={assignedOptions}
            />
          )}
        </Box>
      </Box>

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
    </Box>
  );
}
