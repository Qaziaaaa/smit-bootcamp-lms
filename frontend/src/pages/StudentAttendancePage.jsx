import { useCallback, useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { CalendarCheck, CalendarX, CalendarDays, Percent } from 'lucide-react'
import { getStudentAttendance } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'

// Formats a raw date into a readable label (e.g. Sat, Aug 9, 2026)
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

// Metric card: label + value + icon + accent color
function StatCard({ label, value, icon: Icon, color, bg, borderColor }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}
    >
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
          {label}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 500, color: '#0A0A0A', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: bg,
          border: 1,
          borderColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <Icon size={24} strokeWidth={1.75} />
      </Box>
    </Paper>
  )
}

export default function StudentAttendancePage() {
  // Local state: attendance data from API + loading/error flags
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch attendance records + summary from the API (used on mount and on retry)
  const loadAttendance = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentAttendance()
      setAttendance(data)
    } catch {
      setError('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load attendance once on mount
  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  // Loading state while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#828283">Loading attendance...</Typography>
      </Box>
    )
  }

  // Error state with retry button if the API call failed
  if (error) {
    return <ErrorState message={error} onRetry={loadAttendance} />
  }

  // Derived attendance summary (present / absent / total days / percentage)
  const summary = attendance?.summary ?? { present: 0, absent: 0, totalDays: 0, percentage: 0 }
  const records = attendance?.records ?? []
  const percentage = Math.round(summary.percentage ?? 0)

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Page header */}
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 24, color: '#0A0A0A', letterSpacing: '-0.02em' }}>My Attendance</Typography>
        <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>Your class attendance history (read-only).</Typography>
      </Box>

      {/* Summary metric cards: present / absent / total days / percentage */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        <StatCard label="Present" value={summary.present} icon={CalendarCheck} color="#22C55E" bg="#E8F5E9" borderColor="rgba(34, 197, 94, 0.3)" />
        <StatCard label="Absent" value={summary.absent} icon={CalendarX} color="#EF4444" bg="#FEF2F2" borderColor="rgba(239, 68, 68, 0.3)" />
        <StatCard label="Total Days" value={summary.totalDays} icon={CalendarDays} color="#2D69EB" bg="#F4F9FF" borderColor="rgba(45, 105, 235, 0.2)" />
        <StatCard label="Attendance" value={`${percentage}%`} icon={Percent} color="#D97706" bg="#FFFBEB" borderColor="#FDE68A" />
      </Box>

      {/* Attendance records table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', bgcolor: '#F4F9FF' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 18, color: '#0A0A0A' }}>Attendance History</Typography>
          <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>Every recorded class session, oldest first.</Typography>
        </Box>

        {/* Empty state when no attendance records exist */}
        {records.length === 0 ? (
          <EmptyState message="No attendance records yet." icon={CalendarCheck} />
        ) : (
          <Box>
            {records.map((record, index) => (
              <Box
                key={record._id}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  borderBottom: index < records.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: '#F8FAFA' },
                }}
              >
                {/* Record date */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F8FAFA',
                      border: 1,
                      borderColor: '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#828283',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarDays size={20} strokeWidth={1.75} />
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A' }}>{formatDate(record.date)}</Typography>
                </Box>
                {/* Record status pill (present / absent) */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    ...(record.status === 'present'
                      ? { bgcolor: '#E8F5E9', color: '#166534' }
                      : { bgcolor: '#FEF2F2', color: '#B91C1C' }),
                  }}
                >
                  {record.status}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
