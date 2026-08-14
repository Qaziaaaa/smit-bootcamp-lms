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
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { StudentForm } from '../components/students/StudentForm'
import { MarkAttendanceModal } from '../components/attendance/MarkAttendanceModal'
import { cn } from '../lib/utils'
import { useEffect, useState, useCallback } from 'react'
import { getDashboard } from '../services/dashboardService'
import { apiClient } from '../services/apiClient'
import { toast } from 'sonner'

const TASK_STATUS_STYLE = {
  completed: { icon: Award, iconBg: 'bg-clr-emerald-bg', iconColor: 'text-clr-green' },
  'in-progress': { icon: Clock, iconBg: 'bg-clr-blue-bg', iconColor: 'text-clr-blue' },
  pending: { icon: CheckSquare, iconBg: 'bg-clr-amber-bg', iconColor: 'text-clr-amber-dark' },
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
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
  const todayAttendance = dashboard?.todayAttendance ?? {}

  const STAT_CARDS = [
    {
      label: 'Total Students',
      value: counts.students ?? '0',
      trend: '+12% this month',
      icon: Users,
      iconBg: 'hsl(var(--clr-blue-bg))',
      iconBorder: 'hsl(var(--clr-blue) / 0.2)',
      iconColor: 'hsl(var(--clr-blue))',
    },
    {
      label: 'Attendance',
      value: `${todayAttendance.present ?? 0}/${counts.students ?? 0}`,
      subtitle: 'Present / Total Students',
      icon: CalendarCheck,
      iconBg: 'hsl(var(--clr-emerald-bg))',
      iconBorder: 'hsl(var(--clr-green) / 0.25)',
      iconColor: 'hsl(var(--clr-green))',
    },
    {
      label: 'Active Teams',
      value: counts.teams ?? '0',
      subtitle: 'Across 2 Active Batches',
      icon: Layers,
      iconBg: 'hsl(var(--clr-purple-bg))',
      iconBorder: 'hsl(var(--clr-purple) / 0.2)',
      iconColor: 'hsl(var(--clr-purple))',
    },
    {
      label: 'Absent Students',
      value: todayAttendance.absent ?? '0',
      subtitle: 'Absent Today',
      subtitleColor: 'hsl(var(--clr-red))',
      icon: UserX,
      iconBg: 'hsl(var(--clr-rose-bg))',
      iconBorder: 'hsl(var(--clr-red) / 0.25)',
      iconColor: 'hsl(var(--clr-red))',
    },
  ]

  const ACTIVITY_ITEMS = (dashboard?.recentTasks ?? []).map((task) => {
    const style = TASK_STATUS_STYLE[task.status] ?? TASK_STATUS_STYLE.pending
    return {
      text: task.title,
      meta: `${task.assignedTo?.name ?? '—'} • ${task.projectId?.title ?? 'Project'}`,
      status: task.status,
      icon: style.icon,
      iconBg: style.iconBg,
      iconColor: style.iconColor,
    }
  })

  if (loading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <p className="text-sm text-clr-amber-dark">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:-mt-1 md:-mt-2 -mb-1 sm:-mb-2 md:-mb-3">
      <div className="flex flex-col items-stretch justify-between gap-2 -mb-1 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            SMIT Bootcamp Overview
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Real-time SMIT batch performance, attendance rates, and active team progress.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="default"
            size="sm"
            className="h-9"
            onClick={() => setIsStudentFormOpen(true)}
          >
            <Plus size={16} />
            Add Student
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setIsAttendanceModalOpen(true)}>
            Mark Attendance
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 rounded-lg border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Recent Attendance
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Latest student attendance records
              </p>
            </div>
            <div className="relative w-full sm:w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="Search student..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="h-[420px] w-full max-w-full overflow-x-auto overflow-y-auto border-t">
            <table
              className="w-full min-w-[450px] text-sm [table-layout:fixed] md:min-w-[560px]"
              aria-label="recent attendance table"
            >
              <thead>
                <tr>
                  <th className="w-[40%] px-4 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="w-[14%] px-4 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Batch
                  </th>
                  <th className="w-[26%] px-4 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="w-[20%] px-4 py-1.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-[13px] text-muted-foreground">
                      No matching attendance records found
                    </td>
                  </tr>
                ) : (
                  recentAttendance.map((record) => (
                    <tr
                      key={record.studentId ?? record._id}
                      className="h-14 border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-1.25 align-middle">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Avatar name={record.studentName} className="h-8 w-8 text-xs" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">
                              {record.studentName}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {record.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-1.25 align-middle">
                        <p className="truncate text-xs text-foreground">
                          {record.batch}
                        </p>
                      </td>
                      <td className="px-4 py-1.25 align-middle">
                        <p className="truncate text-xs text-foreground">
                          {formatDate(record.date)}
                        </p>
                      </td>
                      <td className="px-4 py-1.25 text-right align-middle">
                        <Badge status={record.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border bg-card shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 p-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Bootcamp Activity</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Latest task completions and team submissions
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-0.5 text-xs">
              View All Tasks <ArrowUpRight size={14} />
            </Button>
          </div>
          <div className="border-t">
            {ACTIVITY_ITEMS.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/50',
                  index < ACTIVITY_ITEMS.length - 1 && 'border-b',
                )}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      item.iconBg,
                      item.iconColor,
                    )}
                  >
                    <item.icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.text}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                </div>
                <Badge status={item.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  )
}
