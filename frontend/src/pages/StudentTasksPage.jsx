import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { CheckCircle2, CheckSquare, Play, Send } from 'lucide-react'
import { getStudentTasks, updateTaskProgress } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'

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
  const inReviewCount = tasks.filter((task) => task.status === 'review_requested').length
  const inProgressCount = tasks.filter((task) => task.status === 'in-progress' || task.status === 'pending').length

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
            In Progress
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#1E40AF', fontVariantNumeric: 'tabular-nums' }}>
            {inProgressCount}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
            In Review
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#6B21A8', fontVariantNumeric: 'tabular-nums' }}>
            {inReviewCount}
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
                  <Badge status={task.status} />
                  <Badge status={task.priority} />
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
              {/* Progress actions hidden once the task is completed or in review */}
              {!['completed', 'review_requested'].includes(task.status) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Send size={14} />}
                    disabled={updatingId === task._id}
                    onClick={() => handleUpdateStatus(task, 'review_requested')}
                    sx={{ fontSize: 12, minHeight: 32, px: 1.5, bgcolor: '#2D69EB', color: '#ffffff', '&:hover': { bgcolor: '#1E40AF' } }}
                  >
                    Submit for Review
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
