import { Box, Button, Paper, Typography } from '@mui/material'
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
import { useEffect, useState } from 'react'
import { getDashboard } from '../services/dashboardService'

const TASK_STATUS_STYLE = {
  completed: { status: 'Completed', statusColor: '#22C55E', statusBg: '#ECFDF5', icon: Award, iconBg: '#ECFDF5', iconColor: '#22C55E' },
  'in-progress': { status: 'In Progress', statusColor: '#374151', statusBg: '#F1F5F9', icon: Clock, iconBg: '#DBEAFE', iconColor: '#2D69EB' },
  pending: { status: 'Pending', statusColor: '#D97706', statusBg: '#FFFBEB', icon: CheckSquare, iconBg: '#FFFBEB', iconColor: '#D97706' },
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)

        const response = await getDashboard()

        console.log('Dashboard API response:', response)

        setDashboard(response.data)
      } catch (error) {
        console.error('Dashboard API error:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
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
      label: 'Attendance Rate',
      value: todayAttendance.present ?? '0',
      trend: '+2.1% vs last week',
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

  const PROJECT_STATUS = [
    { label: 'Completed', value: `${taskStatus.completed ?? 0} Projects`, color: '#22C55E' },
    { label: 'Active', value: `${taskStatus.inProgress ?? 0} Projects`, color: '#2D69EB' },
    { label: 'On-Hold', value: `${taskStatus.pending ?? 0} Projects`, color: '#828283' },
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
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography
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
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            SMIT Bootcamp Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
            Real-time SMIT batch performance, attendance rates, and active team progress.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button variant="contained" size="small" startIcon={<Plus size={16} />} sx={{ height: 36 }}>
            Add Student
          </Button>
          <Button variant="outlined" size="small" sx={{ height: 36 }}>
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
        <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0A0A0A' }}>
                Attendance Trend (This Week)
              </Typography>
              <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
                Average daily attendance rate percentage
              </Typography>
            </Box>
            <Typography
              component="span"
              sx={{
                display: 'inline-flex',
                px: 1.25,
                py: 0.25,
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                bgcolor: '#D1FAE5',
                color: '#22C55E',
              }}
            >
              96.2% Avg
            </Typography>
          </Box>
          <Box sx={{ p: 3, pt: 0 }}>
            <Box
              sx={{
                height: 256,
                borderRadius: 1,
                border: 1,
                borderStyle: 'dashed',
                borderColor: '#E2E8F0',
                bgcolor: '#F8FAFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#828283',
                fontSize: 14,
              }}
            >
              [Area Chart Placeholder]
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff' }}>
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0A0A0A' }}>Project Status</Typography>
            <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
              Overall bootcamp deliverables
            </Typography>
          </Box>
          <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: '100%',
                height: 192,
                borderRadius: 1,
                border: 1,
                borderStyle: 'dashed',
                borderColor: '#E2E8F0',
                bgcolor: '#F8FAFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#828283',
                fontSize: 14,
                mb: 2,
              }}
            >
              [Pie Chart Placeholder]
            </Box>
            <Box sx={{ width: '100%', display: 'grid', gap: 1 }}>
              {PROJECT_STATUS.map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A' }}>{item.label}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#828283' }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0A0A0A' }}>Recent Bootcamp Activity</Typography>
            <Typography variant="body2" sx={{ color: '#828283', mt: 0.5 }}>
              Latest task completions and team submissions
            </Typography>
          </Box>
          <Button size="small" color="primary" sx={{ fontSize: 12, gap: 0.5 }}>
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
                  <Typography sx={{ fontSize: 10, color: '#828283' }}>{item.meta}</Typography>
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
  )
}
