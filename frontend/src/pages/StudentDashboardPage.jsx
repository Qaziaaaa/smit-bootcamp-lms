import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Box, Button, Paper, Snackbar, Typography } from '@mui/material'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CheckSquare,
  CalendarDays,
  GraduationCap,
  Play,
  Users,
} from 'lucide-react'
import { getStudentAttendance, getStudentProfile, getStudentTasks, updateTaskProgress } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'

// Builds the current week (Sun-Sat) and marks specific days as active based on student schedule
function currentWeek(activeDays = []) {
  const today = new Date()
  const sundayOffset = -today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() + sundayOffset)

  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return names.map((name, index) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + index)

    return {
      name,
      date: day.getDate(),
      active: activeDays.includes(name),
    }
  })
}

// Mock schedule data mapping student emails to their active class days.
// This will be replaced by backend API data in the future.
const MOCK_SCHEDULE_DATA = {
  'student@example.com': ['Fri', 'Sat'],
  'qari@gmail.com': ['Mon', 'Wed', 'Fri'],
  'default': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
}

export default function StudentDashboardPage() {
  // Local state: profile/attendance/tasks fetched from API, plus UI states (loading, error, progress update, toast)
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [snackbar, setSnackbar] = useState(null)

  // Fetch profile, attendance and tasks in parallel; used on mount and on retry
  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profileData, attendanceData, tasksData] = await Promise.all([
        getStudentProfile(),
        getStudentAttendance(),
        getStudentTasks(),
      ])
      setProfile(profileData)
      setAttendance(attendanceData)
      setTasks(tasksData)
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load dashboard data once on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Update task status via API (Start Work -> in-progress, Mark Completed -> completed), then refresh row + toast
  const handleUpdateStatus = async (task, status) => {
    setUpdatingId(task._id)
    try {
      await updateTaskProgress(task._id, status)
      setTasks((prev) => prev.map((item) => (item._id === task._id ? { ...item, status } : item)))
      setSnackbar({ severity: 'success', message: 'Task progress updated' })
    } catch {
      setSnackbar({ severity: 'error', message: 'Failed to update task progress' })
    } finally {
      setUpdatingId(null)
    }
  }

  // Loading state while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#828283">Loading dashboard...</Typography>
      </Box>
    )
  }

  // Error state with retry button if any API call failed
  if (error) {
    return <ErrorState message={error} onRetry={loadData} />
  }

  // Derived values from profile
  const name = profile?.name || 'Student'
  const batch = profile?.batch || '—'
  const teamName = typeof profile?.teamId === 'object' && profile?.teamId ? profile.teamId.name : profile?.teamId || '—'

  // Derived attendance summary (present days / total recorded days, percentage)
  const summary = attendance?.summary ?? { present: 0, absent: 0, totalDays: 0, percentage: 0 }
  const present = summary.present ?? 0
  const totalDays = summary.totalDays ?? 0
  const percentage = Math.round(summary.percentage ?? 0)

  // Dynamic standing status label & text color (background remains clean/unchanged)
  let standingText = 'Good Standing'
  let standingColor = '#22C55E' // Green for >= 75%
  if (percentage < 50) {
    standingText = 'Low Attendance'
    standingColor = '#EF4444' // Red for < 50%
  } else if (percentage < 75) {
    standingText = 'Average Standing'
    standingColor = '#F59E0B' // Orange for 50-74%
  }

  // Derived task counts (active = not yet completed)
  const completedCount = tasks.filter((task) => task.status === 'completed').length
  const activeCount = tasks.length - completedCount

  // Week days used by the class schedule widget
  const studentEmail = profile?.email || 'default'
  const activeDays = MOCK_SCHEDULE_DATA[studentEmail] || MOCK_SCHEDULE_DATA['default']
  const week = currentWeek(activeDays)

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Welcome banner: greeting + batch/team summary + shortcut to sprint tasks */}
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          color: '#ffffff',
          background: 'linear-gradient(90deg, #01579B 0%, #0277BD 50%, #7CB342 100%)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {/* SMIT badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              mb: 1,
              borderRadius: 9999,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <GraduationCap size={16} color="#B9F6CA" />
            <span>Saylani Mass IT Training (SMIT)</span>
          </Box>
          {/* Personalized greeting with student name */}
          <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Welcome back, {name}!
          </Typography>
          {/* Enrollment line: batch and team */}
          <Typography sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}>
            Enrolled in SMIT Batch {batch} - Web Dev • Team {teamName}
          </Typography>
        </Box>
        {/* Quick link to the full tasks page */}
        <Button
          component={Link}
          to="/student/tasks"
          sx={{
            flexShrink: 0,
            bgcolor: '#ffffff',
            color: '#0277BD',
            fontSize: 12,
            fontWeight: 500,
            height: 36,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            '&:hover': { bgcolor: '#F4F9FF' },
          }}
        >
          View My Sprint Tasks <ArrowRight size={16} style={{ marginLeft: 8 }} />
        </Button>
      </Box>

      {/* Overview: 3 metric cards (left) + class schedule widget (right) */}
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
          {/* Metric card: attendance (present/total + percentage pill) */}
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
                My Attendance
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#0A0A0A', fontVariantNumeric: 'tabular-nums' }}>
                {present}/{totalDays}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mt: 1,
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: standingColor,
                }}
              >
                {percentage}% {standingText}
              </Box>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#E8F5E9',
                border: 1,
                borderColor: 'rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22C55E',
                flexShrink: 0,
              }}
            >
              <CalendarCheck size={24} strokeWidth={2} />
            </Box>
          </Paper>

          {/* Metric card: team (name + member subtitle) */}
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
                My Team
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 20, fontWeight: 500, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                {teamName}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 600, color: '#2D69EB' }}>Bootcamp Team Member</Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#F4F9FF',
                border: 1,
                borderColor: 'rgba(45, 105, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2D69EB',
                flexShrink: 0,
              }}
            >
              <Users size={24} strokeWidth={1.75} />
            </Box>
          </Paper>

          {/* Metric card: active task count + completed count */}
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
                Active Tasks
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#0A0A0A', fontVariantNumeric: 'tabular-nums' }}>
                {activeCount}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: '#828283' }}>{completedCount} completed</Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#FFFBEB',
                border: 1,
                borderColor: '#FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                flexShrink: 0,
              }}
            >
              <CheckSquare size={24} strokeWidth={1.75} />
            </Box>
          </Paper>
        </Box>

        {/* Schedule widget: current week grid, class days highlighted */}
        <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, color: '#0A0A0A' }}>
              <CalendarDays size={18} color="#0A0A0A" /> Class Schedule
            </Typography>
          </Box>
          <Box sx={{ px: 2, pb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75 }}>
              {week.map((day) => (
                <Box
                  key={day.name}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(day.active
                      ? { bgcolor: '#22C55E', color: '#ffffff', border: 1, borderColor: '#22C55E' }
                      : { bgcolor: '#ffffff', color: '#828283', border: 1, borderColor: '#E2E8F0' }),
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: day.active ? 600 : 500 }}>{day.name}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: day.active ? 700 : 500, mt: 0.25 }}>{day.date}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Sprint tasks section: list of assigned tasks with progress actions */}
      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: '#F4F9FF',
            p: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 18, color: '#0A0A0A' }}>Sprint Tasks Assigned To You</Typography>
            <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>
              Update your progress as you work on sprint deliverables.
            </Typography>
          </Box>
          {/* Link to the full tasks page */}
          <Button
            component={Link}
            to="/student/tasks"
            sx={{ fontSize: 12, fontWeight: 500, color: '#2D69EB', minHeight: 'auto', p: 0.5, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
          >
            Manage All Tasks
          </Button>
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
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {/* Task title + status pill */}
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A' }}>{task.title}</Typography>
                  <Badge status={task.status} />
                </Box>
                {/* Task description (fallback text when empty) */}
                <Typography sx={{ fontSize: 12, color: '#828283', mt: 0.5 }}>
                  {task.description || 'No description provided.'}
                </Typography>
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

      {/* Toast notification for task progress success/error */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
