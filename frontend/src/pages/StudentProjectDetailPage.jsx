import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, CheckSquare } from 'lucide-react'
import { getStudentProjectById, updateTaskProgress } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { DetailPageSkeleton } from '../components/ui/page-skeletons'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { cn } from '../lib/utils'

function formatDate(date) {
  if (!date) return 'No deadline'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function StudentProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadProject = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentProjectById(id)
      setProject(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const handleUpdateStatus = async (task, status) => {
    setUpdatingId(task._id)
    try {
      await updateTaskProgress(task._id, status)
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((item) => (item._id === task._id ? { ...item, status } : item)),
      }))
    } catch {
      setError('Failed to update task progress')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <DetailPageSkeleton />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProject} />
  }

  if (!project) {
    return <EmptyState message="Project not found." icon={CheckSquare} />
  }

  const tasks = project.tasks || []
  const completedTasks = tasks.filter((task) => task.status === 'completed').length

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/student/projects')}
          title="Back to projects"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Project — {project.title}</h2>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
            {project.description && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Badge status={project.status} />
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {project.deadline && (
            <div>
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Deadline</p>
              <p className="flex items-center gap-0.5 text-[13px] text-foreground">
                <Calendar size={14} className="text-muted-foreground" />
                {formatDate(project.deadline)}
              </p>
            </div>
          )}
          {project.team && (
            <div>
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Team Assigned</p>
              <p className="flex items-center gap-0.5 text-[13px] text-foreground">
                <Users size={14} className="text-muted-foreground" />
                {project.team.name} ({project.team.memberCount || 0} members)
              </p>
            </div>
          )}
          <div>
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Task Progress</p>
            <p className="text-[13px] text-foreground">{completedTasks} / {tasks.length} completed</p>
            {tasks.length > 0 && (
              <Progress value={(completedTasks / tasks.length) * 100} className="mt-1 h-2" />
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b border-border bg-clr-blue-bg p-2.5">
          <h3 className="text-lg font-semibold text-foreground">My Tasks ({tasks.length})</h3>
          <p className="mt-0.25 text-[13px] text-muted-foreground">Update your progress as you work on this project.</p>
        </div>

        {tasks.length === 0 ? (
          <EmptyState message="No tasks assigned to you for this project yet." icon={CheckSquare} />
        ) : (
          tasks.map((task, index) => (
            <div
              key={task._id}
              className={cn(
                'flex flex-col gap-2 p-2 hover:bg-muted sm:flex-row sm:items-center sm:justify-between',
                index < tasks.length - 1 && 'border-b border-border',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[13px] font-medium text-foreground">{task.title}</span>
                  <Badge status={task.status} />
                  <Badge status={task.priority} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {task.description || 'No description provided.'}
                </p>
                <p className="mt-0.75 text-[11px] text-muted-foreground">Deadline: {formatDate(task.deadline)}</p>
              </div>
              {task.status !== 'completed' && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    className="text-xs"
                    disabled={updatingId === task._id}
                    onClick={() => handleUpdateStatus(task, 'in-progress')}
                  >
                    Start Work
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs"
                    disabled={updatingId === task._id}
                    onClick={() => handleUpdateStatus(task, 'completed')}
                  >
                    Mark Completed
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
