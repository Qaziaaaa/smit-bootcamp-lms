import { useCallback, useEffect, useState } from 'react'
import { FolderKanban, Mail, Users } from 'lucide-react'
import { getStudentTeam } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'

// Renders a member card: initials avatar + name, email and batch
function MemberCard({ member }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border bg-card p-2 shadow-sm">
      {/* Initials avatar */}
      <Avatar name={member.name} className="h-10 w-10" />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-foreground">{member.name}</p>
        <p className="mt-0.25 flex items-center gap-0.5 text-xs text-muted-foreground">
          <Mail size={12} /> {member.email}
        </p>
        {member.batch && (
          <p className="mt-0.25 text-[11px] text-muted-foreground">Batch {member.batch}</p>
        )}
      </div>
    </div>
  )
}

export default function StudentTeamPage() {
  // Local state: team data from API + loading/error flags
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch the student's team (name + members + project) from the API
  const loadTeam = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentTeam()
      setTeam(data)
    } catch {
      setError('Failed to load team')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load the team once on mount
  useEffect(() => {
    loadTeam()
  }, [loadTeam])

  // Loading state while fetching data
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Loading team...</p>
      </div>
    )
  }

  // Error state with retry button if the API call failed
  if (error) {
    return <ErrorState message={error} onRetry={loadTeam} />
  }

  // Empty state when the student has not been assigned to any team yet
  if (!team) {
    return <EmptyState message="You have not been assigned to a team yet." icon={Users} />
  }

  const members = team.members ?? []
  const project = team.project

  return (
    <div className="grid gap-3">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Team</h2>
        <p className="mt-0.25 text-[13px] text-muted-foreground">Your bootcamp team and its members.</p>
      </div>

      {/* Team info + linked project */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Team name card */}
        <div className="flex items-center gap-1.5 rounded-lg border bg-card p-2.5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-clr-blue-border bg-clr-blue-bg text-clr-blue">
            <Users size={24} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Team Name</p>
            <p className="mt-0.5 truncate text-xl font-semibold text-foreground">{team.name}</p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Batch</p>
                <p className="mt-0.25 text-sm text-foreground">{team.batch || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Team Leader</p>
                <p className="mt-0.25 text-sm text-foreground">
                  {team.leader
                    ? (members.find(m => String(m._id) === String(team.leader))?.name || 'Unknown')
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Project card (if a project is linked) */}
        {project ? (
          <div className="flex items-center gap-1.5 rounded-lg border bg-card p-2.5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-clr-amber-border bg-clr-amber-bg text-clr-amber">
              <FolderKanban size={24} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Project</p>
              <p className="mt-0.5 truncate text-base font-semibold text-foreground">{project.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {project.description || 'No description provided.'}
              </p>
            </div>
            {/* Project status pill */}
            <Badge status={project.status} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg border bg-card p-2.5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <FolderKanban size={24} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Project</p>
              <p className="mt-0.5 text-sm text-muted-foreground">No project linked to this team yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* Team members list */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b border-border bg-clr-blue-bg p-2.5">
          <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
          <p className="mt-0.25 text-[13px] text-muted-foreground">Everyone assigned to this team.</p>
        </div>
        {/* Members grid */}
        {members.length === 0 ? (
          <EmptyState message="No team members available right now." icon={Users} />
        ) : (
          <div className="grid grid-cols-1 gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
