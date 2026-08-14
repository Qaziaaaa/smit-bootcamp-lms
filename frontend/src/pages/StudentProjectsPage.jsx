import { useCallback, useEffect, useState } from 'react'
import { FolderKanban, Users, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getStudentProjects } from '../services/studentService'
import { EmptyState, ErrorState } from '../components/ui/StateComponents'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

// Renders a single project card for the student
function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Badge status={project.status} />
      </div>

      <div className="mt-1 flex flex-wrap gap-3">
        {project.deadline && (
          <div>
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Deadline</p>
            <p className="flex items-center gap-0.5 text-[13px] text-foreground">
              <Calendar size={14} className="text-muted-foreground" />
              {new Date(project.deadline).toLocaleDateString()}
            </p>
          </div>
        )}
        {project.team && (
          <div>
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Team Assigned</p>
            <p className="flex items-center gap-0.5 text-[13px] text-foreground">
              <Users size={14} className="text-muted-foreground" />
              {project.team.name} ({project.team.memberCount || 0} members)
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto flex justify-end border-t border-border pt-2">
        <Button
          variant="ghost"
          className="font-semibold"
          onClick={() => navigate(`/student/projects/${project._id || project.id}`)}
        >
          View Project <ArrowRight size={16} />
        </Button>
      </div>
    </div>
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
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProjects} />
  }

  if (projects.length === 0) {
    return <EmptyState message="You have no active projects assigned to you." icon={FolderKanban} />
  }

  return (
    <div className="grid gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Projects</h2>
        <p className="mt-0.25 text-[13px] text-muted-foreground">Track and manage the projects you are working on.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project._id || project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
