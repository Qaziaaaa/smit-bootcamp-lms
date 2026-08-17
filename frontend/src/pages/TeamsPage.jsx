import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as z from 'zod';
import { cn } from '../lib/utils';

import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import { Label } from '../components/ui/Label';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { SearchBar } from '../components/ui/SearchBar';
import { getTeams, createTeam, updateTeam, deleteTeam, getTeamById } from '../services/teamsService';
import { getProjects } from '../services/projectsService';
import { getStudents } from '../services/studentsService';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
  members: z.array(z.string()).min(1, 'At least one team member is required'),
  leader: z.string().min(1, 'Team leader is required'),
});

const emptyForm = { name: '', members: [], leader: '' };

export default function TeamsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [projectMap, setProjectMap] = useState({});
  const [students, setStudents] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  const [formValues, setFormValues] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [memberSearch, setMemberSearch] = useState('');
  const [leaderSearch, setLeaderSearch] = useState('');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTeams({ search });
      setTeams(result.teams || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const loadReferenceData = useCallback(async () => {
    try {
      const [projRes, stuRes] = await Promise.all([getProjects({ limit: 500 }), getStudents({ limit: 500 })]);
      const projList = Array.isArray(projRes) ? projRes : (projRes?.projects || projRes?.data || []);
      const map = {};
      if (Array.isArray(projList)) {
        projList.forEach((p) => {
          if (p && p._id) map[p._id] = p.title;
        });
      }
      setProjectMap(map);

      const stuList = Array.isArray(stuRes) ? stuRes : (stuRes?.students || stuRes?.data || []);
      setStudents(stuList);
    } catch (err) {
      console.error('Failed to fetch reference data:', err);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  const openCreate = () => {
    loadReferenceData();
    setEditingTeam(null);
    setFormValues(emptyForm);
    setFormErrors({});
    setMemberSearch('');
    setLeaderSearch('');
    setIsFormOpen(true);
  };

  const openEdit = async (team) => {
    loadReferenceData();
    setEditingTeam(team);
    setFormValues({ ...emptyForm, name: team.name, leader: team.leader || '' });
    setFormErrors({});
    setMemberSearch('');
    setLeaderSearch('');
    setIsFormOpen(true);

    try {
      const fullTeam = await getTeamById(team._id);
      const memberIds = (fullTeam.members || []).map((m) => m._id || m.id);
      setFormValues({
        name: fullTeam.name,
        members: memberIds,
        leader: fullTeam.leader || '',
      });
    } catch {
      toast.error('Failed to load full team details');
    }
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    const result = teamSchema.safeParse(formValues);
    if (!result.success) {
      const next = {};
      for (const issue of result.error.issues) {
        if (!next[issue.path[0]]) next[issue.path[0]] = issue.message;
      }
      setFormErrors(next);
      return;
    }
    try {
      if (editingTeam) {
        await updateTeam(editingTeam._id, result.data);
        toast.success('Team updated successfully');
      } else {
        await createTeam(result.data);
        toast.success('Team created successfully');
      }
      setIsFormOpen(false);
      await fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save team');
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    try {
      await deleteTeam(deletingTeam._id);
      toast.success('Team deleted successfully');
      setDeletingTeam(null);
      await fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const setField = (name) => (e) => {
    setFormValues((v) => ({ ...v, [name]: e.target.value }));
    setFormErrors((err) => ({ ...err, [name]: undefined }));
  };

  const toggleMember = (id) => {
    setFormValues((v) => {
      const members = v.members.includes(id) ? v.members.filter((x) => x !== id) : [...v.members, id];
      return {
        ...v,
        members,
        leader: members.includes(v.leader) ? v.leader : '',
      };
    });
    setFormErrors((err) => ({ ...err, members: undefined }));
  };

  const getStudentRoll = (s) => {
    if (!s) return '';
    const raw = s.rollNo ?? s.rollNumber;
    if (raw !== undefined && raw !== null && raw !== '') {
      return String(raw);
    }
    const id = s._id || s.id;
    return id ? `STU-${String(id).slice(-4).toUpperCase()}` : '';
  };

  const selectLeader = (sId) => {
    setFormValues((v) => ({
      ...v,
      leader: sId,
    }));
    setFormErrors((err) => ({ ...err, leader: undefined }));
  };

  const filteredMemberStudents = useMemo(() => {
    if (!memberSearch || !memberSearch.trim()) return students;
    const lower = memberSearch.trim().toLowerCase();
    return students.filter((s) => {
      const name = String(s.name || '').toLowerCase();
      const roll = getStudentRoll(s).toLowerCase();
      const email = String(s.email || '').toLowerCase();
      return name.includes(lower) || roll.includes(lower) || email.includes(lower);
    });
  }, [students, memberSearch]);

  const filteredLeaderStudents = useMemo(() => {
    const selectedMembers = students.filter((s) => formValues.members.includes(s._id || s.id));
    if (!leaderSearch || !leaderSearch.trim()) return selectedMembers;
    const lower = leaderSearch.trim().toLowerCase();
    return selectedMembers.filter((s) => {
      const name = String(s.name || '').toLowerCase();
      const roll = getStudentRoll(s).toLowerCase();
      const email = String(s.email || '').toLowerCase();
      return name.includes(lower) || roll.includes(lower) || email.includes(lower);
    });
  }, [students, formValues.members, leaderSearch]);

  const renderSelectedMembers = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return 'Select members';
    return students
      .filter((s) => selectedIds.includes(s._id || s.id))
      .map((s) => {
        const roll = getStudentRoll(s);
        return roll ? `${s.name} (${roll})` : s.name;
      })
      .join(', ');
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'TEAM NAME',
      cell: ({ getValue }) => <span className="text-sm font-semibold text-foreground">{getValue()}</span>,
    },
    {
      accessorKey: 'memberCount',
      header: 'MEMBERS',
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users size={16} />
          {getValue() || 0} students
        </span>
      ),
    },
    {
      accessorKey: 'leader',
      header: 'TEAM LEADER',
      cell: ({ getValue }) => {
        const leaderId = getValue();
        if (!leaderId) return <span className="text-sm text-muted-foreground">—</span>;
        const leader = students.find((s) => (s._id || s.id) === leaderId);
        return <span className="text-sm text-foreground">{leader ? leader.name : 'Unknown'}</span>;
      },
    },
    {
      accessorKey: 'projectId',
      header: 'PROJECT',
      cell: ({ getValue }) => (
        <span className="text-sm text-foreground">{getValue() ? projectMap[getValue()] || '—' : '—'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/teams/${row.original._id}`)} aria-label="View team">
            <Eye size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-clr-blue" onClick={() => openEdit(row.original)} aria-label="Edit team">
            <Edit2 size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingTeam(row.original)} aria-label="Delete team">
            <Trash2 size={18} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage student teams and project assignments.</p>
        </div>
        <Button onClick={openCreate}>
          <Users size={18} />
          Add Team
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search teams..." />
      </div>

      <DataTable data={teams} columns={columns} isLoading={loading} emptyMessage="No teams found" />
      <Pagination page={page} totalPages={1} totalItems={teams.length} onChange={setPage} />

      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Add New Team'}
        hideDividers
      >
        <form onSubmit={handleSaveTeam}>
          <p className="mb-6 text-sm text-muted-foreground">
            {editingTeam ? 'Update team name, members, and leadership.' : 'Create a new team, select team members, and assign a team lead.'}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Team Name"
              name="name"
              className="sm:col-span-2"
              value={formValues.name}
              onChange={setField('name')}
              error={formErrors.name}
              required
              placeholder="e.g. Alpha Team"
            />

            <div className="space-y-1.5 sm:col-span-2">
              <Label>
                Team Members
                <span className="text-destructive"> *</span>
              </Label>
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="mb-2">
                  <SearchBar
                    value={memberSearch}
                    onChange={setMemberSearch}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="Search students by name or roll no..."
                    delay={0}
                    className="w-full max-w-none"
                  />
                </div>
                <div className="max-h-48 space-y-0.5 overflow-y-auto">
                  {filteredMemberStudents.length === 0 ? (
                    <p className="px-1.5 py-2 text-sm text-muted-foreground">No students found.</p>
                  ) : (
                    filteredMemberStudents.map((student) => {
                      const sId = student._id || student.id;
                      const checked = formValues.members.includes(sId);
                      const roll = getStudentRoll(student);
                      return (
                        <div
                          key={sId}
                          onClick={() => toggleMember(sId)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-left hover:bg-accent"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggleMember(sId)} />
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="text-sm text-foreground">{student.name}</span>
                            {roll && <span className="font-mono text-xs text-muted-foreground">({roll})</span>}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {formErrors.members && <p className="text-xs font-medium text-destructive">{formErrors.members}</p>}
              {formValues.members.length > 0 && (
                <p className="text-xs text-muted-foreground">{renderSelectedMembers(formValues.members)}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>
                Team Lead
                <span className="text-destructive"> *</span>
              </Label>
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="mb-2">
                  <SearchBar
                    value={leaderSearch}
                    onChange={setLeaderSearch}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="Search team lead by name or roll no..."
                    delay={0}
                    className="w-full max-w-none"
                  />
                </div>
                <div className="max-h-48 space-y-0.5 overflow-y-auto">
                  {filteredLeaderStudents.length === 0 ? (
                    <p className="px-1.5 py-2 text-sm text-muted-foreground">
                      {formValues.members.length === 0
                        ? 'Please select team members above first.'
                        : 'No matching team members found.'}
                    </p>
                  ) : (
                    filteredLeaderStudents.map((student) => {
                      const sId = student._id || student.id;
                      const isSelected = formValues.leader === sId;
                      const roll = getStudentRoll(student);
                      return (
                        <div
                          key={sId}
                          onClick={() => selectLeader(sId)}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-accent',
                            isSelected && 'bg-primary/10 font-semibold',
                          )}
                        >
                          <input
                            type="radio"
                            name="teamLeader"
                            checked={isSelected}
                            onChange={() => selectLeader(sId)}
                            className="h-4 w-4 text-primary pointer-events-none"
                          />
                          <span className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
                            <span>{student.name}</span>
                            {roll && <span className="font-mono text-xs text-muted-foreground">({roll})</span>}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {formErrors.leader && <p className="text-xs font-medium text-destructive">{formErrors.leader}</p>}
              {formValues.leader && (() => {
                const leaderObj = students.find((s) => (s._id || s.id) === formValues.leader);
                if (!leaderObj) return null;
                const roll = getStudentRoll(leaderObj);
                return (
                  <p className="text-xs text-muted-foreground">
                    Selected Lead: <span className="font-medium text-foreground">{leaderObj.name}</span> {roll && `(${roll})`}
                  </p>
                );
              })()}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingTeam ? 'Save Changes' : 'Create Team'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deletingTeam}
        title={deletingTeam ? `Delete Team: ${deletingTeam.name}` : 'Delete Team'}
        message="Are you sure you want to delete this team? Students will become unassigned."
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeletingTeam(null)}
      />
    </div>
  );
}
