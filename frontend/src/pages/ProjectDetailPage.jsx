import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toastInfo } from '../lib/toast';

import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
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
        <p className="min-w-[140px] text-sm font-semibold text-foreground">{getValue()}</p>
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
      accessorKey: 'priority',
      header: 'PRIORITY',
      cell: ({ getValue }) => (
        <div className="whitespace-nowrap">
          <Badge status={getValue()} label={getValue()} />
        </div>
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
            className="h-8 w-8 text-clr-blue"
            title="Edit task"
            onClick={() => {
              setEditingTask(row.original);
              setIsTaskFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            title="Delete task"
            onClick={() => setDeleteTaskId(row.original._id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
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
        toastInfo('All tasks are already completed');
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
      <div className="w-full p-3">
        <p className="text-sm text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full p-3">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex flex-col gap-3 p-3">

      {/* Topbar — "Project — {title}" + Edit button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/projects')} title="Back to projects">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Project — {project.title}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEditProjectOpen(true)}
        >
          <Edit2 size={16} />
          Edit Project
        </Button>
      </div>

      {/* Two-column layout: Info card | Tasks subview */}
      <div className="grid gap-3">

        {/* Info card */}
              <div className="col-span-12 md:col-span-8">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-8 overflow-x-auto">
      
            {/* Title */}
            <div className="min-w-[140px] shrink-0">
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {project.title}
              </p>
            </div>
      
            {/* Description */}
            {project.description && (
              <>
                <div className="h-10 w-px shrink-0 bg-border" />
      
                <div className="min-w-[180px] max-w-[220px] shrink-0">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="mt-1 truncate text-sm text-foreground">
                    {project.description}
                  </p>
                </div>
              </>
            )}
      
            {/* Assigned Team */}
            <div className="h-10 w-px shrink-0 bg-border" />
      
            <div className="min-w-[130px] shrink-0">
              <p className="text-xs text-muted-foreground">Assigned Team</p>
              <p className="mt-1 truncate text-sm text-foreground">
                {project.teamId?.name || '—'}
              </p>
            </div>
      
            {/* Status */}
            <div className="h-10 w-px shrink-0 bg-border" />
      
            <div className="min-w-[100px] shrink-0">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <Badge status={project.status} />
              </div>
            </div>
      
            {/* Deadline */}
            <div className="h-10 w-px shrink-0 bg-border" />
      
            <div className="min-w-[110px] shrink-0">
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="mt-1 text-sm text-foreground">
                {project.deadline
                  ? String(project.deadline).slice(0, 10)
                  : '—'}
              </p>
            </div>
      
            {/* Task Progress */}
            <div className="h-10 w-px shrink-0 bg-border" />
      
            <div className="min-w-[180px] shrink-0">
              <p className="text-xs text-muted-foreground">Task Progress</p>
      
              <p className="mt-1 text-sm font-semibold text-foreground">
                {completedTasks} / {tasks.length} completed
              </p>
      
              {tasks.length > 0 && (
                <Progress
                  value={(completedTasks / tasks.length) * 100}
                  className="mt-2 h-2 bg-clr-emerald-bg [&>div]:bg-clr-green"
                />
              )}
      
              <p className="mt-1 text-[11px] text-muted-foreground">
                {tasks.length > 0
                  ? `${Math.round(
                      (completedTasks / tasks.length) * 100
                    )}% overall completion`
                  : 'No tasks assigned yet'}
              </p>
            </div>
      
          </div>
        </div>
      </div>

        {/* Tasks subview */}
        <div className="col-span-12 md:col-span-8">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 p-3">
              <h2 className="text-base font-semibold text-foreground">
                Tasks ({tasks.length})
              </h2>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkConfirm(true)}
                >
                  <CheckCircle size={16} />
                  Mark All Done
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskFormOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Add Task
                </Button>
              </div>
            </div>

            <div className="p-2">
              <DataTable
                data={tasks}
                columns={taskColumns}
                emptyMessage="No tasks for this project yet"
              />
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
