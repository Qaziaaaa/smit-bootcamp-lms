import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Grid, IconButton } from '@mui/material';
import { ArrowLeft, Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskForm } from '../components/tasks/TaskForm';

// Dummy project data — mirrors GET /projects/:id response
// Fields per API: title, description, teamId (populated), status, deadline
const DUMMY_PROJECTS = {
  p1: {
    id: 'p1',
    title: 'LMS Web App',
    description: 'Full-stack learning management system for Saylani bootcamp students and administrators.',
    team: 'Team Alpha',
    teamId: 't1',
    status: 'active',
    deadline: '2026-10-15',
  },
  p2: {
    id: 'p2',
    title: 'E-commerce API',
    description: 'REST API backend for an online storefront with cart and payments.',
    team: 'Team Beta',
    teamId: 't2',
    status: 'active',
    deadline: '2026-09-30',
  },
  p3: {
    id: 'p3',
    title: 'Portfolio Generator',
    description: 'Auto-generates developer portfolios from GitHub profiles.',
    team: 'Team Gamma',
    teamId: 't3',
    status: 'completed',
    deadline: '2026-08-01',
  },
  p4: {
    id: 'p4',
    title: 'AI Analytics Dashboard',
    description: 'Business intelligence dashboard powered by ML analytics.',
    team: 'Team Alpha',
    teamId: 't1',
    status: 'on-hold',
    deadline: '2026-12-01',
  },
};

// Dummy tasks for this project — mirrors GET /tasks?projectId=
// Fields per DATABASE_SCHEMA.md: title, status, priority, assignedTo, deadline
const DUMMY_TASKS = {
  p1: [
    { id: 'tk1', title: 'Design Heatmap Component', status: 'pending', priority: 'high', assignedTo: 'Maya Lin', deadline: '2026-08-15' },
    { id: 'tk2', title: 'Setup TanStack Query Cache', status: 'completed', priority: 'medium', assignedTo: 'John Doe', deadline: '2026-08-10' },
    { id: 'tk3', title: 'Build Auth Middleware', status: 'in-progress', priority: 'high', assignedTo: 'Sarah Smith', deadline: '2026-08-12' },
    { id: 'tk4', title: 'Implement Student CRUD', status: 'completed', priority: 'medium', assignedTo: 'Maya Lin', deadline: '2026-08-08' },
    { id: 'tk5', title: 'Write API documentation', status: 'pending', priority: 'low', assignedTo: null, deadline: '2026-09-01' },
  ],
  p2: [
    { id: 'tk6', title: 'Cart API endpoints', status: 'pending', priority: 'high', assignedTo: null, deadline: '2026-09-15' },
    { id: 'tk7', title: 'Payment integration', status: 'pending', priority: 'high', assignedTo: null, deadline: '2026-09-20' },
  ],
  p3: [],
  p4: [],
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fallback for unknown IDs during dummy data phase
  const [project, setProject] = useState(DUMMY_PROJECTS[id] || DUMMY_PROJECTS['p1']);
  const [tasks, setTasks] = useState(DUMMY_TASKS[id] || []);

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  // Task table columns — matches 4.10 tasks subview: status, priority, assigned, deadline, actions
  const taskColumns = [
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
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'priority',
      header: 'PRIORITY',
      cell: ({ getValue }) => {
        const colorMap = { high: 'error', medium: 'warning', low: 'info' };
        return <Badge status={getValue()} label={getValue()} />;
      },
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
              setIsTaskFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            title="Delete task"
            onClick={() => setDeleteTaskId(row.original.id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSaveProject = async (data) => {
    await new Promise((r) => setTimeout(r, 400));
    setProject((prev) => ({ ...prev, ...data }));
    toast.success('Project updated successfully');
  };

  const handleSaveTask = async (data) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t)));
      toast.success('Task updated successfully');
    } else {
      const newTask = { id: `tk-${Date.now()}`, assignedTo: null, ...data };
      setTasks((prev) => [...prev, newTask]);
      toast.success('Task created successfully');
    }
  };

  const handleDeleteTask = async () => {
    await new Promise((r) => setTimeout(r, 400));
    setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
    toast.success('Task deleted');
    setDeleteTaskId(null);
  };

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Project not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Topbar — "Project — {title}" + Edit button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/projects')} size="small" title="Back to projects">
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Project — {project.title}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit2 size={16} />}
          onClick={() => setIsEditProjectOpen(true)}
        >
          Edit Project
        </Button>
      </Box>

      {/* Two-column layout: Info card | Tasks subview */}
      <Grid container spacing={3}>

        {/* Info card — matches blueprint 4.10 left column */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', mb: 2, letterSpacing: 1 }}
            >
              Project Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Title</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{project.title}</Typography>
              </Box>
              {project.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                    {project.description}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Assigned Team</Typography>
                <Typography variant="body2">{project.team || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Badge status={project.status} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Deadline</Typography>
                <Typography variant="body2">{project.deadline || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Task Progress</Typography>
                <Typography variant="body2">
                  {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} completed
                </Typography>
                {tasks.length > 0 && (
                  <Box
                    sx={{
                      mt: 1,
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100}%`,
                        height: '100%',
                        bgcolor: 'success.main',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Tasks subview — matches blueprint 4.10 right column */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tasks ({tasks.length})
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                disableElevation
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskFormOpen(true);
                }}
              >
                Add Task
              </Button>
            </Box>

            <Box sx={{ p: 2 }}>
              <DataTable
                data={tasks}
                columns={taskColumns}
                emptyMessage="No tasks for this project yet"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Project Modal */}
      <ProjectForm
        open={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleSaveProject}
        initialData={project}
      />

      {/* Add / Edit Task Modal (locked to this project) */}
      <TaskForm
        open={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        lockedProjectId={id}
      />

      {/* Delete Task Confirm */}
      <ConfirmDialog
        open={!!deleteTaskId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
      />
    </Box>
  );
}
