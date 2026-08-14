import { useCallback, useEffect, useState } from 'react'
import { CheckSquare, Send } from 'lucide-react'
import { getStudentTasks, updateTaskProgress } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'

// Formats a raw date into a readable label (e.g. Sat, Aug 9, 2026)
function formatDate(date) {
  if (!date) return 'No deadline'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function StudentTasksPage() {
  // Local state: tasks from API + UI states (loading, error, progress update)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch tasks assigned to the student (used on mount and on retry)
  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentTasks()
      setTasks(data)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load tasks once on mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Update task status via API (Start Work -> in-progress, Mark Completed -> completed), then refresh row
  const handleUpdateStatus = async (task, status) => {
    setUpdatingId(task._id)
    try {
      await updateTaskProgress(task._id, status)
      setTasks((prev) => prev.map((item) => (item._id === task._id ? { ...item, status } : item)))
    } catch {
      setError('Failed to update task progress')
    } finally {
      setUpdatingId(null)
    }
  }

  // Loading state while fetching data
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    )
  }

  // Error state with retry button if any API call failed
  if (error) {
    return <ErrorState message={error} onRetry={loadTasks} />
  }

  // Derived task counts by status for the summary cards
  const completedCount = tasks.filter((task) => task.status === 'completed').length
  const inReviewCount = tasks.filter((task) => task.status === 'review_requested').length
  const inProgressCount = tasks.filter((task) => task.status === 'in-progress' || task.status === 'pending').length

  return (
    <div className="grid gap-3">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Tasks</h2>
        <p className="mt-0.25 text-[13px] text-muted-foreground">All sprint tasks assigned to you.</p>
      </div>

      {/* Summary cards: pending / in-progress / completed */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-2.5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Progress</p>
          <p className="mt-0.5 text-2xl font-medium tabular-nums text-clr-blue-dark">{inProgressCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-2.5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Review</p>
          <p className="mt-0.5 text-2xl font-medium tabular-nums text-clr-purple">{inReviewCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-2.5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="mt-0.5 text-2xl font-medium tabular-nums text-clr-green-dark">{completedCount}</p>
        </div>
      </div>

      {/* Tasks list */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b border-border bg-clr-blue-bg p-2.5">
          <h3 className="text-lg font-semibold text-foreground">Assigned Tasks</h3>
          <p className="mt-0.25 text-[13px] text-muted-foreground">Update your progress as you work on sprint deliverables.</p>
        </div>

        {/* Empty state when no tasks are assigned */}
        {tasks.length === 0 ? (
          <EmptyState message="No tasks assigned yet." icon={CheckSquare} />
        ) : (
          tasks.map((task, index) => (
            <div
              key={task._id}
              className={cn(
                'flex flex-col gap-2 p-2 hover:bg-muted sm:flex-row sm:items-center sm:justify-between',
                index < tasks.length - 1 && 'border-b border-border',
              )}
            >
              {/* Task info: title + status pill + project + description + meta */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[13px] font-medium text-foreground">{task.title}</span>
                  <Badge status={task.status} />
                  <Badge status={task.priority} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {task.description || 'No description provided.'}
                </p>
                {/* Meta line: linked project + deadline */}
                <div className="mt-0.75 flex flex-wrap items-center gap-1.5">
                  {task.projectId?.title && (
                    <span className="text-[11px] font-medium text-clr-blue">
                      Project: {task.projectId.title}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">Deadline: {formatDate(task.deadline)}</span>
                </div>
              </div>
              {/* Progress actions hidden once the task is completed or in review */}
              {!['completed', 'review_requested'].includes(task.status) && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    className="text-xs"
                    disabled={updatingId === task._id}
                    onClick={() => handleUpdateStatus(task, 'review_requested')}
                  >
                    <Send size={14} /> Submit for Review
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
