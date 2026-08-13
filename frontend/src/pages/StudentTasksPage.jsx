import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { CheckCircle2, CheckSquare, Play } from 'lucide-react'
import { getStudentTasks, updateTaskProgress } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'

// Colors/background for each task status badge (pending, in-progress, completed)
const TASK_STYLE = {
  pending: { label: 'Pending', color: '#92400E', bg: '#FEF3C7' },
  'in-progress': { label: 'In Progress', color: '#1E40AF', bg: '#DBEAFE' },
  completed: { label: 'Completed', color: '#166534', bg: '#DCFCE7' },
}

// Colors/background for each task priority badge
const PRIORITY_STYLE = {
  low: { label: 'Low', color: '#1E40AF', bg: '#DBEAFE' },
  medium: { label: 'Medium', color: '#92400E', bg: '#FEF3C7' },
  high: { label: 'High', color: '#B91C1C', bg: '#FEE2E2' },
}

// Renders a small rounded pill showing the task status
function StatusPill({ status }) {
  const style = TASK_STYLE[status] ?? TASK_STYLE.pending
  return (
    <Typography
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.25,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        bgcolor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </Typography>
  )
}

// Renders a small rounded pill showing the task priority
function PriorityPill({ priority }) {
  const style = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.medium
  return (
    <Typography
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.25,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        bgcolor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </Typography>
  )
}

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
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#828283">Loading tasks...</Typography>
      </Box>
    )
  }

  // Error state with retry button if any API call failed
  if (error) {
    return <ErrorState message={error} onRetry={loadTasks} />
  }

  // Derived task counts by status for the summary cards
  const completedCount = tasks.filter((task) => task.status === 'completed').length
  const inProgressCount = tasks.filter((task) => task.status === 'in-progress').length
  const pendingCount = tasks.filter((task) => task.status === 'pending').length

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Page header */}
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 24, color: '#0A0A0A', letterSpacing: '-0.02em' }}>My Tasks</Typography>
        <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>All sprint tasks assigned to you.</Typography>
      </Box>

      {/* Summary cards: pending / in-progress / completed */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
            Pending
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#92400E', fontVariantNumeric: 'tabular-nums' }}>
            {pendingCount}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
            In Progress
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#1E40AF', fontVariantNumeric: 'tabular-nums' }}>
            {inProgressCount}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
            Completed
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#166534', fontVariantNumeric: 'tabular-nums' }}>
            {completedCount}
          </Typography>
        </Paper>
      </Box>

      {/* Tasks list */}
      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', bgcolor: '#F4F9FF' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 18, color: '#0A0A0A' }}>Assigned Tasks</Typography>
          <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>Update your progress as you work on sprint deliverables.</Typography>
        </Box>

        {/* Empty state when no tasks are assigned */}
        {tasks.length === 0 ? (
          <EmptyState message="No tasks assigned yet." icon={CheckSquare} />
        ) : (
          tasks.map((task, index) => (
            <Box
              key={task._id}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                borderBottom: index < tasks.length - 1 ? 1 : 0,
                borderColor: 'divider',
                '&:hover': { bgcolor: '#F8FAFA' },
              }}
            >
              {/* Task info: title + status pill + project + description + meta */}
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A' }}>{task.title}</Typography>
                  <StatusPill status={task.status} />
                  <PriorityPill priority={task.priority} />
                </Box>
                <Typography sx={{ fontSize: 12, color: '#828283', mt: 0.5 }}>
                  {task.description || 'No description provided.'}
                </Typography>
                {/* Meta line: linked project + deadline */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.75 }}>
                  {task.projectId?.title && (
                    <Typography sx={{ fontSize: 11, color: '#2D69EB', fontWeight: 500 }}>
                      Project: {task.projectId.title}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 11, color: '#828283' }}>Deadline: {formatDate(task.deadline)}</Typography>
                </Box>
              </Box>
              {/* Progress actions hidden once the task is completed */}
              {task.status !== 'completed' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  {/* Start Work: moves a pending task to in-progress */}
                  {task.status === 'pending' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Play size={14} />}
                      disabled={updatingId === task._id}
                      onClick={() => handleUpdateStatus(task, 'in-progress')}
                      sx={{
                        fontSize: 12,
                        minHeight: 32,
                        px: 1.5,
                        color: '#2D69EB',
                        borderColor: '#2D69EB',
                        '&:hover': { bgcolor: '#F4F9FF', borderColor: '#2D69EB' },
                      }}
                    >
                      Start Work
                    </Button>
                  )}
                  {/* Mark Completed: finishes the task */}
                  <Button
                    size="small"
                    startIcon={<CheckCircle2 size={14} />}
                    disabled={updatingId === task._id}
                    onClick={() => handleUpdateStatus(task, 'completed')}
                    sx={{ fontSize: 12, minHeight: 32, px: 1.5, bgcolor: '#22C55E', color: '#ffffff', '&:hover': { bgcolor: '#16A34A' } }}
                  >
                    Mark Completed
                  </Button>
                </Box>
              )}
            </Box>
          ))
        )}
      </Paper>
    </Box>
  )
}
