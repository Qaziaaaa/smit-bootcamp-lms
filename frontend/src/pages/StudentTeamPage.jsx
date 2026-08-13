import { useCallback, useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { FolderKanban, Mail, Users } from 'lucide-react'
import { getStudentTeam } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'

// Renders a member card: initials avatar + name, email and batch
function MemberCard({ member }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: 2, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}
    >
      {/* Initials avatar */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: '#2D69EB',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {member.name.charAt(0).toUpperCase()}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {member.name}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#828283', mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Mail size={12} /> {member.email}
        </Typography>
        {member.batch && (
          <Typography sx={{ fontSize: 11, color: '#828283', mt: 0.25 }}>Batch {member.batch}</Typography>
        )}
      </Box>
    </Paper>
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
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#828283">Loading team...</Typography>
      </Box>
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
  const projectStatusStyle = {
    active: { label: 'Active', color: '#166534', bg: '#DCFCE7' },
    completed: { label: 'Completed', color: '#1E40AF', bg: '#DBEAFE' },
    'on-hold': { label: 'On Hold', color: '#92400E', bg: '#FEF3C7' },
  }[project?.status] ?? { label: '—', color: '#828283', bg: '#F1F5F9' }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* Page header */}
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 24, color: '#0A0A0A', letterSpacing: '-0.02em' }}>My Team</Typography>
        <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>Your bootcamp team and its members.</Typography>
      </Box>

      {/* Team info + linked project */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {/* Team name card */}
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
              Team Name
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 20, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {team.name}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12, color: '#828283' }}>
              {members.length} member{members.length === 1 ? '' : 's'}
            </Typography>
          </Box>
        </Paper>

        {/* Project card (if a project is linked) */}
        {project ? (
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              <FolderKanban size={24} strokeWidth={1.75} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
                Project
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.title}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: '#828283' }}>
                {project.description || 'No description provided.'}
              </Typography>
            </Box>
            {/* Project status pill */}
            <Box
              sx={{
                ml: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.25,
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                bgcolor: projectStatusStyle.bg,
                color: projectStatusStyle.color,
              }}
            >
              {projectStatusStyle.label}
            </Box>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
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
              <FolderKanban size={24} strokeWidth={1.75} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#828283' }}>
                Project
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 14, color: '#828283' }}>No project linked to this team yet.</Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Team members list */}
      <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', bgcolor: '#F4F9FF' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 18, color: '#0A0A0A' }}>Team Members</Typography>
          <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>Everyone assigned to this team.</Typography>
        </Box>
        {/* Members grid */}
        {members.length === 0 ? (
          <EmptyState message="No team members available right now." icon={Users} />
        ) : (
          <Box sx={{ p: 2, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
            {members.map((member) => (
              <MemberCard key={member._id} member={member} />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
