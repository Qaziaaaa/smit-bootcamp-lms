import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FilterBar } from '../components/ui/FilterBar';
import { getTeamById, assignStudentsToTeam } from '../services/teamsService';
import { getStudents } from '../services/studentsService';

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTeamById(id);
      setTeam(result);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const fetchAvailableStudents = useCallback(async () => {
    try {
      const result = await getStudents({ limit: 500 });
      const memberIds = new Set((team?.members || []).map((m) => String(m._id)));
      setAvailableStudents(
        (result.students || []).filter((s) => !memberIds.has(String(s._id)))
      );
    } catch {
      toast.error('Failed to load available students');
    }
  }, [team]);

  useEffect(() => {
    if (isAssignOpen) {
      fetchAvailableStudents();
      setSelectedStudent('');
    }
  }, [isAssignOpen, fetchAvailableStudents]);

  const handleAssign = async () => {
    if (!selectedStudent) return;
    try {
      await assignStudentsToTeam(id, [selectedStudent]);
      toast.success('Student assigned to team');
      setIsAssignOpen(false);
      await fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign student');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] p-3">
        <p className="text-sm text-muted-foreground">Loading team...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto max-w-[1200px] p-3">
        <p className="text-sm text-muted-foreground">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3 p-3">

      {/* Topbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/teams')} title="Back to teams">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Team — {team.name}
          </h1>
        </div>
        <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
          <UserPlus size={16} />
          Assign Student
        </Button>
      </div>

      <div className="grid gap-3">
        {/* Team Info */}
        <div className="col-span-12 md:col-span-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium uppercase text-muted-foreground">Team Information</p>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Team Name</p>
                <p className="text-sm font-semibold text-foreground">{team.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Batch</p>
                <p className="text-sm text-foreground">{team.batch || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned Project</p>
                <p className="text-sm text-foreground">{team.project?.title || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Project Status</p>
                <div className="mt-0.5">
                  {team.project ? <Badge status={team.project.status} /> : <p className="text-sm text-muted-foreground">—</p>}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Team Leader</p>
                <p className="text-sm text-foreground">
                  {team.leader
                    ? (team.members.find((m) => String(m._id) === String(team.leader))?.name || 'Unknown')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-sm font-semibold text-foreground">{team.members.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="col-span-12 md:col-span-8">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 p-3">
              <h2 className="text-base font-semibold text-foreground">Team Members ({team.members.length})</h2>
            </div>
            <ul className="divide-y divide-border">
              {team.members.map((member) => (
                <li key={member._id} className="flex items-center gap-3 px-4 py-2">
                  <Avatar name={member.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge status={member.status} />
                </li>
              ))}
              {team.members.length === 0 && (
                <li className="p-4 text-center text-sm text-muted-foreground">
                  No members in this team yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Student to Team"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedStudent}>Assign</Button>
          </>
        }
      >
        <div className="pt-1">
          {availableStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unassigned students available.</p>
          ) : (
            <FilterBar
              label="Select Student"
              value={selectedStudent}
              onChange={setSelectedStudent}
              options={availableStudents.map((s) => ({ label: `${s.name} (${s.email})`, value: s._id }))}
            />
          )}
        </div>
      </Modal>

    </div>
  );
}
