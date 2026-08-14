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
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  ArrowUpRight,
  Award,
  CalendarCheck,
  CheckSquare,
  Clock,
  Layers,
  Plus,
  Search,
  Users,
  UserX,
} from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { Avatar } from '../components/ui/Avatar'
import { StudentForm } from '../components/students/StudentForm'
import { MarkAttendanceModal } from '../components/attendance/MarkAttendanceModal'
import { useEffect, useState, useCallback } from 'react'
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
  const [attendanceSearch, setAttendanceSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)

  const loadDashboard = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await getDashboard()
      setDashboard(response)
    } catch (error) {
      console.error('Dashboard API error:', error)
      setError('Failed to load dashboard data')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  const loadRecentAttendance = useCallback(async () => {
    try {
      const params = { limit: 10 }
      if (attendanceSearch && attendanceSearch.trim()) {
        params.search = attendanceSearch.trim()
      }
      const response = await apiClient.get('/attendance', { params })
      setRecentAttendance(response.data?.data?.records ?? [])
    } catch (error) {
      console.error('Recent attendance error:', error)
    }
  }, [attendanceSearch])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleAttendanceSuccess = () => {
    loadDashboard(false)
    loadRecentAttendance()
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      loadRecentAttendance()
    }, 300)

    return () => clearTimeout(handler)
  }, [attendanceSearch, loadRecentAttendance])

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
      label: 'Absent Students',
      value: todayAttendance.absent ?? '0',
      subtitle: 'Absent Today',
      subtitleColor: '#DC2626',
      icon: UserX,
      iconBg: '#FEF2F2',
      iconBorder: 'rgba(239, 68, 68, 0.25)',
      iconColor: '#EF4444',
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
          <Typography variant="h4" sx={{ fontWeight: 500, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
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
          <Button variant="outlined" size="small" sx={{ height: 36 }} onClick={() => setIsAttendanceModalOpen(true)}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, p: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0A0A0A' }}>
                Recent Attendance
              </Typography>
              <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
                Latest student attendance records
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search student..."
              value={attendanceSearch}
              onChange={(e) => setAttendanceSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 200 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="#828283" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <TableContainer sx={{ borderTop: 1, borderColor: 'divider', maxWidth: '100%', width: '100%', overflowX: 'auto', height: 420, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table sx={{ minWidth: { xs: 450, md: 560 }, tableLayout: 'fixed' }} aria-label="recent attendance table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: '40%',
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
                      width: '14%',
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
                      width: '26%',
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
                      width: '20%',
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
                {recentAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#828283', fontSize: 13 }}>
                      No matching attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentAttendance.map((record) => (
                    <TableRow
                      key={record.studentId ?? record._id}
                      sx={{
                        height: 56,
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: '#F8FAFA' },
                      }}
                    >
                      <TableCell sx={{ py: 1.25, verticalAlign: 'middle' }}>
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
                      <TableCell sx={{ py: 1.25, verticalAlign: 'middle' }}>
                        <Typography sx={{ fontSize: 12, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {record.batch}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.25, verticalAlign: 'middle' }}>
                        <Typography sx={{ fontSize: 12, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formatDate(record.date)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.25, verticalAlign: 'middle' }}>
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
                            bgcolor: record.status === 'present' ? '#ECFDF5' : record.status === 'absent' ? '#FEF2F2' : '#F1F5F9',
                            color: record.status === 'present' ? '#22C55E' : record.status === 'absent' ? '#DC2626' : '#64748B',
                          }}
                        >
                          {record.status ?? 'Not Marked'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

      <MarkAttendanceModal
        open={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSuccess={handleAttendanceSuccess}
      />
    </Box>
  )
}
