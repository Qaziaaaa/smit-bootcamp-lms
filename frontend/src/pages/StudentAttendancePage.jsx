import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck, CalendarX, CalendarDays, Percent } from 'lucide-react'
import { getStudentAttendance } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { cn } from '../lib/utils'

// Formats a raw date into a readable label (e.g. Sat, Aug 9, 2026)
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
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
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Loading attendance...</p>
      </div>
    )
  }

  // Error state with retry button if the API call failed
  if (error) {
    return <ErrorState message={error} onRetry={loadAttendance} />
  }

  // Derived attendance summary (present / absent / total days / percentage)
  const summary = attendance?.summary ?? { present: 0, absent: 0, totalDays: 0, percentage: 0 }
  const rawRecords = attendance?.records ?? []
  const records = [...rawRecords].sort((a, b) => new Date(b.date) - new Date(a.date))
  const percentage = Math.round(summary.percentage ?? 0)

  return (
    <div className="grid gap-3">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Attendance</h2>
        <p className="mt-0.25 text-[13px] text-muted-foreground">Your class attendance history (read-only).</p>
      </div>

      {/* Summary metric cards: present / absent / total days / percentage */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Present" value={summary.present} icon={CalendarCheck} iconBg="hsl(var(--clr-emerald-bg))" iconBorder="hsl(var(--clr-green) / 0.25)" iconColor="hsl(var(--clr-green))" />
        <StatCard label="Absent" value={summary.absent} icon={CalendarX} iconBg="hsl(var(--clr-rose-bg))" iconBorder="hsl(var(--clr-red) / 0.25)" iconColor="hsl(var(--clr-red))" />
        <StatCard label="Total Days" value={summary.totalDays} icon={CalendarDays} iconBg="hsl(var(--clr-blue-bg))" iconBorder="hsl(var(--clr-blue) / 0.2)" iconColor="hsl(var(--clr-blue))" />
        <StatCard label="Attendance" value={`${percentage}%`} icon={Percent} iconBg="hsl(var(--clr-amber-bg))" iconBorder="hsl(var(--clr-amber) / 0.3)" iconColor="hsl(var(--clr-amber))" />
      </div>

      {/* Attendance records table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b border-border bg-clr-blue-bg p-2.5">
          <h3 className="text-lg font-semibold text-foreground">Attendance History</h3>
          <p className="mt-0.25 text-[13px] text-muted-foreground">Every recorded class session, most recent first.</p>
        </div>

        {/* Empty state when no attendance records exist */}
        {records.length === 0 ? (
          <EmptyState message="No attendance records yet." icon={CalendarCheck} />
        ) : (
          <div>
            {records.map((record, index) => (
              <div
                key={record._id}
                className={cn(
                  'flex items-center justify-between gap-2 p-2 hover:bg-muted',
                  index < records.length - 1 && 'border-b border-border',
                )}
              >
                {/* Record date */}
                <div className="flex items-center gap-1.25">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                    <CalendarDays size={20} strokeWidth={1.75} />
                  </div>
                  <span className="text-[13px] font-medium text-foreground">{formatDate(record.date)}</span>
                </div>
                {/* Record status pill (present / absent) */}
                <Badge status={record.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
