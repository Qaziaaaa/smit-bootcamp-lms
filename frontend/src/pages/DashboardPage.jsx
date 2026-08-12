import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  ArrowUpRight,
  Award,
  CalendarCheck,
  CheckSquare,
  Clock,
  Layers,
  Plus,
  Users,
} from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { Avatar } from '../components/ui/Avatar'
import { StudentForm } from '../components/students/StudentForm'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../services/dashboardService'
import { apiClient } from '../services/apiClient'
import { toast } from 'sonner'

const TASK_STATUS_STYLE = {
  completed: { status: 'Completed', statusColor: '#22C55E', statusBg: '#ECFDF5', icon: Award, iconBg: '#ECFDF5', iconColor: '#22C55E' },
  'in-progress': { status: 'In Progress', statusColor: '#374151', statusBg: '#F1F5F9', icon: Clock, iconBg: '#DBEAFE', iconColor: '#2D69EB' },
  pending: { status: 'Pending', statusColor: '#D97706', statusBg: '#FFFBEB', icon: CheckSquare, iconBg: '#FFFBEB', iconColor: '#D97706' },
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)

        const response = await getDashboard()

        setDashboard(response)
      } catch (error) {
        console.error('Dashboard API error:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  useEffect(() => {
    const loadRecentAttendance = async () => {
      try {
        const response = await apiClient.get('/attendance', { params: { limit: 5 } })
        setRecentAttendance(response.data?.data?.records ?? [])
      } catch (error) {
        console.error('Recent attendance error:', error)
      }
    }

    loadRecentAttendance()
  }, [])

  const counts = dashboard?.counts ?? {}
  const taskStatus = dashboard?.taskStatus ?? {}
  const todayAttendance = dashboard?.todayAttendance ?? {}

  const STAT_CARDS = [
    {
      label: 'Total Students',
      value: counts.students ?? '0',
      trend: '+12% this month',
      icon: Users,
      iconBg: '#F4F9FF',
      iconBorder: 'rgba(45, 105, 235, 0.2)',
      iconColor: '#2D69EB',
    },
    {
      label: 'Attendance',
      value: `${todayAttendance.present ?? 0}/${counts.students ?? 0}`,
      subtitle: 'Present / Total Students',
      icon: CalendarCheck,
      iconBg: '#ECFDF5',
      iconBorder: 'rgba(34, 197, 94, 0.25)',
      iconColor: '#22C55E',
    },
    {
      label: 'Active Teams',
      value: counts.teams ?? '0',
      subtitle: 'Across 2 Active Batches',
      icon: Layers,
      iconBg: '#EEF2FF',
      iconBorder: 'rgba(47, 43, 112, 0.2)',
      iconColor: '#2F2B70',
    },
    {
      label: 'Pending Tasks',
      value: taskStatus.pending ?? '0',
      subtitle: 'Requires Student Review',
      subtitleColor: '#D97706',
      icon: CheckSquare,
      iconBg: '#FFFBEB',
      iconBorder: 'rgba(217, 119, 6, 0.25)',
      iconColor: '#D97706',
    },
  ]

  const ACTIVITY_ITEMS = (dashboard?.recentTasks ?? []).map((task) => {
    const style = TASK_STATUS_STYLE[task.status] ?? TASK_STATUS_STYLE.pending
    return {
      text: task.title,
      meta: `${task.assignedTo?.name ?? '—'} • ${task.projectId?.title ?? 'Project'}`,
      status: style.status,
      statusColor: style.statusColor,
      statusBg: style.statusBg,
      icon: style.icon,
      iconBg: style.iconBg,
      iconColor: style.iconColor,
    }
  })

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#828283">Loading dashboard...</Typography>
      </Box>
    )
  }

  if (error || !dashboard) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#D97706">Failed to load dashboard data</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 3, mt: { xs: 0, sm: -1, md: -2 }, mb: { xs: -1, sm: -2, md: -3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between', gap: 2, mb: -1 }}>
        <Box>
          {/* <Typography
            component="span"
            sx={{
              display: 'inline-flex',
              px: 1.25,
              py: 0.25,
              mb: 1,
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 500,
              bgcolor: 'rgba(2, 119, 189, 0.1)',
              color: '#0277BD',
            }}
          >
            Saylani Mass IT Training (SMIT)
          </Typography> */}
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            SMIT Bootcamp Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
            Real-time SMIT batch performance, attendance rates, and active team progress.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            sx={{ height: 36 }}
            onClick={() => setIsStudentFormOpen(true)}
          >
            Add Student
          </Button>
          <Button variant="outlined" size="small" sx={{ height: 36 }} onClick={() => navigate('/attendance')}>
            Mark Attendance
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0A0A0A' }}>
                Recent Attendance
              </Typography>
              <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
                Latest student attendance records
              </Typography>
            </Box>
            <Button size="small" color="primary" sx={{ fontSize: 12, gap: 0.5, '&:hover': { backgroundColor: '#F0F5FF' } }}>
              View All <ArrowUpRight size={14} />
            </Button>
          </Box>
          <TableContainer sx={{ borderTop: 1, borderColor: 'divider', maxWidth: '100%', width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table sx={{ minWidth: { xs: 450, md: 560 } }} aria-label="recent attendance table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      py: 1.5,
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#828283',
                    }}
                  >
                    Student
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#828283',
                    }}
                  >
                    Batch
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#828283',
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      py: 1.5,
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#828283',
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAttendance.map((record) => (
                  <TableRow
                    key={record.studentId ?? record._id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: '#F8FAFA' },
                    }}
                  >
                    <TableCell sx={{ py: 1.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Avatar name={record.studentName} sx={{ width: 32, height: 32, fontSize: 12 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A' }} noWrap>
                            {record.studentName}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: '#828283' }} noWrap>
                            {record.studentEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography sx={{ fontSize: 12, color: '#0A0A0A' }}>{record.batch}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography sx={{ fontSize: 12, color: '#0A0A0A' }}>{formatDate(record.date)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.25 }}>
                      <Typography
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          px: 1.25,
                          py: 0.25,
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          bgcolor: record.status === 'present' ? '#ECFDF5' : '#FEF2F2',
                          color: record.status === 'present' ? '#22C55E' : '#DC2626',
                        }}
                      >
                        {record.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0A0A0A' }}>Recent Bootcamp Activity</Typography>
              <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
                Latest task completions and team submissions
              </Typography>
            </Box>
            <Button size="small" color="primary" sx={{ fontSize: 12, gap: 0.5, '&:hover': { backgroundColor: '#F0F5FF' } }}>
              View All Tasks <ArrowUpRight size={14} />
            </Button>
          </Box>
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
            {ACTIVITY_ITEMS.map((item, index) => (
              <Box
                key={index}
                sx={{
                  px: 3,
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  borderBottom: index < ACTIVITY_ITEMS.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: '#F8FAFA' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      bgcolor: item.iconBg,
                      color: item.iconColor,
                    }}
                  >
                    <item.icon size={16} strokeWidth={1.75} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A' }} noWrap>
                      {item.text}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#828283' }} noWrap>
                      {item.meta}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  component="span"
                  sx={{
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    bgcolor: item.statusBg,
                    color: item.statusColor,
                  }}
                >
                  {item.status}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      <StudentForm
        open={isStudentFormOpen}
        onClose={() => setIsStudentFormOpen(false)}
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          toast.success('Student created successfully')
          setIsStudentFormOpen(false)
        }}
      />
    </Box>
  )
}
