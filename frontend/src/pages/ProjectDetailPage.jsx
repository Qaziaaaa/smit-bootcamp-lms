import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Grid, IconButton } from '@mui/material';
import { ArrowLeft, Edit2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskForm } from '../components/tasks/TaskForm';
import { getProjectById, updateProject } from '../services/projectsService';
import { createTask, updateTask, deleteTask } from '../services/tasksService';
import { getTeams } from '../services/teamsService';
import { getStudents } from '../services/studentsService';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProjectById(id);
      setProject(result);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    getTeams()
      .then((result) => setTeams(result.teams || []))
      .catch(() => setTeams([]));
    getStudents({ limit: 500 })
      .then((result) => setStudents(result.students || []))
      .catch(() => setStudents([]));
  }, []);

  const tasks = project?.tasks || [];

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
      cell: ({ getValue }) => <Badge status={getValue()} label={getValue()} />,
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
            onClick={() => setDeleteTaskId(row.original._id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSaveProject = async (data) => {
    try {
      await updateProject(id, data);
      toast.success('Project updated successfully');
      await fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
      throw error;
    }
  };

  const handleSaveTask = async (data) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, data);
        toast.success('Task updated successfully');
      } else {
        await createTask(data);
        toast.success('Task created successfully');
      }
      await fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(deleteTaskId);
      toast.success('Task deleted');
      setDeleteTaskId(null);
      await fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleMarkAllCompleted = async () => {
    setBulkLoading(true);
    try {
      const pending = tasks.filter((t) => t.status !== 'completed');
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
      await fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark tasks completed');
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="body2" color="text.secondary">Loading project...</Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="body2" color="text.secondary">Project not found.</Typography>
      </Box>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

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

        {/* Info card */}
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
                <Typography variant="body2">{project.teamId?.name || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Badge status={project.status} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Deadline</Typography>
                <Typography variant="body2">{project.deadline ? String(project.deadline).slice(0, 10) : '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Task Progress</Typography>
                <Typography variant="body2">
                  {completedTasks} / {tasks.length} completed
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
                        width: `${(completedTasks / tasks.length) * 100}%`,
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

        {/* Tasks subview */}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckCircle size={16} />}
                  onClick={() => setBulkConfirm(true)}
                >
                  Mark All Done
                </Button>
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
        teams={teams}
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
        projects={[project]}
        students={students}
      />

      {/* Delete Task Confirm */}
      <ConfirmDialog
        open={!!deleteTaskId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
      />

      {/* Bulk Complete Confirm */}
      <ConfirmDialog
        open={bulkConfirm}
        title="Mark All Tasks Completed"
        message="This will mark every task in this project as completed. This action cannot be undone. Continue?"
        confirmText="Mark All Done"
        confirmColor="success"
        loading={bulkLoading}
        onConfirm={handleMarkAllCompleted}
        onCancel={() => setBulkConfirm(false)}
      />
    </Box>
  );
}
