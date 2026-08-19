import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { toast } from 'react-hot-toast'
import { getStudentAttendance, getStudentProfile, getStudentTasks, updateTaskProgress } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { cn } from '../lib/utils'

function currentWeek(activeDays = []) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // If today is Sunday (weekend/off day), display the upcoming active week starting Monday
  const mondayOffset = dayOfWeek === 0 ? 1 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return names.map((name, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)

    return {
      name,
      date: String(day.getDate()).padStart(2, '0'),
      isToday: day.toDateString() === today.toDateString(),
      active: activeDays.includes(name),
    }
  })
}

const DEFAULT_ACTIVE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentDashboardPage() {
  // Local state: profile/attendance/tasks fetched from API, plus UI states (loading, error, progress update, toast)
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

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
      toast.success('Task progress updated')
    } catch {
      toast.error('Failed to update task progress')
    } finally {
      setUpdatingId(null)
    }
  }

  // Loading state while fetching data
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
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

  // Dynamic standing status label & text color
  let standingText = 'Good Standing'
  let standingColor = 'hsl(var(--clr-green))' // Green for >= 75%
  if (percentage < 50) {
    standingText = 'Low Attendance'
    standingColor = 'hsl(var(--clr-red))' // Red for < 50%
  } else if (percentage < 75) {
    standingText = 'Average Standing'
    standingColor = 'hsl(var(--clr-amber))' // Orange for 50-74%
  }

  // Derived task counts (active = not yet completed)
  const completedCount = tasks.filter((task) => task.status === 'completed').length
  const activeCount = tasks.length - completedCount

  // Week days used by the class schedule widget
  const activeDays = DEFAULT_ACTIVE_DAYS
  const week = currentWeek(activeDays)

  return (
    <div className="grid gap-3">
      {/* Welcome banner: greeting + batch/team summary + shortcut to sprint tasks */}
      <div style={{ background: 'linear-gradient(135deg, #61bb46 0%, #61bb46 15%, #0873b9 35%)' }} className="flex flex-col gap-2 rounded-xl p-3 text-white shadow-md md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          {/* SMIT badge */}
          <div className="mb-1 inline-flex items-center gap-0.75 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold backdrop-blur">
            <GraduationCap size={16} className="text-clr-green-bg" />
            <span>Saylani Mass IT Training (SMIT)</span>
          </div>
          {/* Personalized greeting with student name */}
          <h2 className="text-xl font-medium tracking-tight sm:text-2xl">Welcome back, {name}!</h2>
          {/* Enrollment line: batch and team */}
          <p className="mt-0.5 text-xs text-white/90">Enrolled in SMIT Batch {batch} - Web Dev • Team {teamName}</p>
        </div>
        {/* Quick link to the full tasks page */}
        <Button asChild className="h-9 shrink-0 bg-card text-xs font-medium text-clr-blue shadow-sm hover:bg-clr-blue-bg">
          <Link to="/student/tasks">
            View My Sprint Tasks <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </div>

      {/* Overview: 3 metric cards (left) + class schedule widget (right) */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-2 sm:grid-cols-3">
          {/* Metric card: attendance (present/total + standing subtitle) */}
          <StatCard
            label="My Attendance"
            value={`${present}/${totalDays}`}
            subtitle={`${percentage}% ${standingText}`}
            subtitleColor={standingColor}
            icon={CalendarCheck}
            iconBg="hsl(var(--clr-emerald-bg))"
            iconBorder="hsl(var(--clr-green) / 0.25)"
            iconColor="hsl(var(--clr-green))"
          />
          {/* Metric card: team (name + member subtitle) */}
          <StatCard
            label="My Team"
            value={teamName}
            subtitle="Bootcamp Team Member"
            subtitleColor="hsl(var(--clr-blue))"
            icon={Users}
          />
          {/* Metric card: active task count + completed count */}
          <StatCard
            label="Active Tasks"
            value={activeCount}
            subtitle={`${completedCount} completed`}
            icon={CheckSquare}
            iconBg="hsl(var(--clr-amber-bg))"
            iconBorder="hsl(var(--clr-amber) / 0.3)"
            iconColor="hsl(var(--clr-amber))"
          />
        </div>

        {/* Schedule widget: current week grid, class days highlighted */}
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="px-2 pb-1.5 pt-2">
            <h3 className="flex items-center gap-1 text-base font-semibold text-foreground">
              <CalendarDays size={18} className="text-foreground" /> Class Schedule
            </h3>
          </div>
          <div className="px-2 pb-2">
            <div className="grid grid-cols-7 gap-0.75">
              {week.map((day) => (
                <div
                  key={day.name}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-md border p-1',
                    day.active
                      ? 'border-clr-green bg-clr-green text-white'
                      : 'border-border bg-card text-muted-foreground',
                  )}
                >
                  <span className={day.active ? 'text-[11px] font-semibold' : 'text-[11px] font-medium'}>{day.name}</span>
                  <span className={cn('mt-0.25 text-sm', day.active ? 'font-bold' : 'font-medium')}>{day.date}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-clr-green-dark">
              Mon to Sat • 9:00 AM to 2:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Sprint tasks section: list of assigned tasks with progress actions */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-border bg-clr-blue-bg p-2.5 sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Sprint Tasks Assigned To You</h3>
            <p className="mt-0.25 text-[13px] text-muted-foreground">
              Update your progress as you work on sprint deliverables.
            </p>
          </div>
          {/* Link to the full tasks page */}
          <Button asChild variant="ghost" className="h-auto p-0.5 text-xs font-medium text-clr-blue hover:bg-transparent hover:underline">
            <Link to="/student/tasks">Manage All Tasks</Link>
          </Button>
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
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  {/* Task title + status pill */}
                  <span className="text-[13px] font-medium text-foreground">{task.title}</span>
                  <Badge status={task.status} />
                </div>
                {/* Task description (fallback text when empty) */}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {task.description || 'No description provided.'}
                </p>
              </div>
              {/* Progress actions hidden once the task is completed */}
              {task.status !== 'completed' && (
                <div className="flex shrink-0 items-center gap-1">
                  {/* Start Work: moves a pending task to in-progress */}
                  {task.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-clr-blue text-xs text-clr-blue hover:border-clr-blue hover:bg-clr-blue-bg"
                      disabled={updatingId === task._id}
                      onClick={() => handleUpdateStatus(task, 'in-progress')}
                    >
                      <Play size={14} /> Start Work
                    </Button>
                  )}
                  {/* Mark Completed: finishes the task */}
                  <Button
                    variant="success"
                    size="sm"
                    className="text-xs"
                    disabled={updatingId === task._id}
                    onClick={() => handleUpdateStatus(task, 'completed')}
                  >
                    <CheckCircle2 size={14} /> Mark Completed
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
