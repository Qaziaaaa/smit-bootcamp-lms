import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { CheckSquare, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TaskForm } from '../components/tasks/TaskForm';

// Dummy data — follows API contract: GET /tasks?projectId=&status=&assignedTo=&search=
// Fields per DATABASE_SCHEMA.md: title, projectId, status, priority, assignedTo, deadline
const DUMMY_TASKS = [
  { id: 'tk1', title: 'Design Heatmap Component', project: 'LMS Web App', projectId: 'p1', status: 'pending', priority: 'high', assignedTo: 'Maya Lin', deadline: '2026-08-15' },
  { id: 'tk2', title: 'Setup TanStack Query Cache', project: 'LMS Web App', projectId: 'p1', status: 'completed', priority: 'medium', assignedTo: 'John Doe', deadline: '2026-08-10' },
  { id: 'tk3', title: 'Build Auth Middleware', project: 'LMS Web App', projectId: 'p1', status: 'in-progress', priority: 'high', assignedTo: 'Sarah Smith', deadline: '2026-08-12' },
  { id: 'tk4', title: 'Implement Student CRUD', project: 'LMS Web App', projectId: 'p1', status: 'completed', priority: 'medium', assignedTo: 'Maya Lin', deadline: '2026-08-08' },
  { id: 'tk5', title: 'Write API documentation', project: 'LMS Web App', projectId: 'p1', status: 'pending', priority: 'low', assignedTo: null, deadline: '2026-09-01' },
  { id: 'tk6', title: 'Cart API endpoints', project: 'E-commerce API', projectId: 'p2', status: 'pending', priority: 'high', assignedTo: null, deadline: '2026-09-15' },
  { id: 'tk7', title: 'Payment integration', project: 'E-commerce API', projectId: 'p2', status: 'pending', priority: 'high', assignedTo: null, deadline: '2026-09-20' },
];

const PROJECT_OPTIONS = [
  { label: 'LMS Web App', value: 'p1' },
  { label: 'E-commerce API', value: 'p2' },
  { label: 'Portfolio Generator', value: 'p3' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

const ASSIGNED_OPTIONS = [
  { label: 'Maya Lin', value: 'Maya Lin' },
  { label: 'John Doe', value: 'John Doe' },
  { label: 'Sarah Smith', value: 'Sarah Smith' },
];

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [page, setPage] = useState(1);

  const [tasks, setTasks] = useState(DUMMY_TASKS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Client-side filter — mirrors ?projectId=&status=&assignedTo=&search= query params
  const filtered = tasks.filter((t) => {
    if (projectFilter && t.projectId !== projectFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (assignedFilter && t.assignedTo !== assignedFilter) return false;
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !(t.assignedTo || '').toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

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
      accessorKey: 'project',
      header: 'PROJECT',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue() || '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'ASSIGNED TO',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">
          {getValue() || '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'PRIORITY',
      // Priority uses Badge — the statusColorMap handles high/medium/low via mapped fallbacks
      cell: ({ getValue }) => {
        const v = getValue();
        // Map priority to badge-compatible values
        const priorityMap = { high: 'absent', medium: 'pending', low: 'in-progress' };
        return <Badge status={priorityMap[v] || 'default'} label={v} />;
      },
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
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSave = async (data) => {
    // Stub — will call POST /tasks or PUT /tasks/:id on Day 5
    await new Promise((r) => setTimeout(r, 400));
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t))
      );
      toast.success('Task updated successfully');
    } else {
      const newTask = {
        id: `tk-${Date.now()}`,
        project: PROJECT_OPTIONS.find((p) => p.value === data.projectId)?.label || '',
        assignedTo: data.assignedTo || null,
        ...data,
      };
      setTasks((prev) => [...prev, newTask]);
      toast.success('Task created successfully');
    }
  };

  const handleDelete = async () => {
    // Stub — will call DELETE /tasks/:id on Day 5
    await new Promise((r) => setTimeout(r, 400));
    setTasks((prev) => prev.filter((t) => t.id !== deleteId));
    toast.success('Task deleted successfully');
    setDeleteId(null);
  };

  const totalPages = Math.ceil(filtered.length / 10);

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

      {/* Toolbar — Search + Project / Status / Assigned filters */}
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search task or assignee..." />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FilterBar
            label="All Projects"
            value={projectFilter}
            onChange={setProjectFilter}
            options={PROJECT_OPTIONS}
          />
          <FilterBar
            label="All Statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <FilterBar
            label="All Assignees"
            value={assignedFilter}
            onChange={setAssignedFilter}
            options={ASSIGNED_OPTIONS}
          />
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        data={filtered}
        columns={columns}
        emptyMessage="No tasks found"
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
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
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
