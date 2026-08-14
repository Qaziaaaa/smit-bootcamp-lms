import React, { useCallback, useEffect, useState } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import { FolderKanban, Users, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getStudentProjects } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'

// Renders a single project card for the student
function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#0A0A0A' }}>
            {project.title}
          </Typography>
          {project.description && (
            <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {project.description}
            </Typography>
          )}
        </Box>
        <Badge status={project.status} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
        {project.deadline && (
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#828283', mb: 0.5 }}>Deadline</Typography>
            <Typography sx={{ fontSize: 13, color: '#0A0A0A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Calendar size={14} color="#828283" />
              {new Date(project.deadline).toLocaleDateString()}
            </Typography>
          </Box>
        )}
        {project.team && (
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#828283', mb: 0.5 }}>Team Assigned</Typography>
            <Typography sx={{ fontSize: 13, color: '#0A0A0A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Users size={14} color="#828283" />
              {project.team.name} ({project.team.memberCount || 0} members)
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="text" 
          endIcon={<ArrowRight size={16} />}
          onClick={() => navigate(`/student/projects/${project._id || project.id}`)}
          sx={{ fontWeight: 600 }}
        >
          View Project
        </Button>
      </Box>
    </Paper>
  )
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentProjects()
      setProjects(data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects. The backend API may not be implemented yet.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <Typography color="#828283">Loading projects...</Typography>
      </Box>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProjects} />
  }

  if (projects.length === 0) {
    return <EmptyState message="You have no active projects assigned to you." icon={FolderKanban} />
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 24, color: '#0A0A0A', letterSpacing: '-0.02em' }}>My Projects</Typography>
        <Typography sx={{ fontSize: 13, color: '#828283', mt: 0.25 }}>Track and manage the projects you are working on.</Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        {projects.map((project) => (
          <ProjectCard key={project._id || project.id} project={project} />
        ))}
      </Box>
    </Box>
  )
}
