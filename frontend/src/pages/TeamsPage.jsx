import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Eye, Edit2, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { SearchBar } from '../components/ui/SearchBar';
import { Select } from '../components/ui/Select';
import { getTeams, createTeam, updateTeam, deleteTeam, getTeamById } from '../services/teamsService';
import { getProjects } from '../services/projectsService';
import { getStudents } from '../services/studentsService';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
  batch: z.string().optional(),
  projectId: z.string().optional(),
  members: z.array(z.string()).min(1, 'At least one team member is required'),
  leader: z.string().min(1, 'Team leader is required'),
});

const emptyForm = { name: '', batch: '', projectId: '', members: [], leader: '' };

export default function TeamsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [students, setStudents] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  const [formValues, setFormValues] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [memberSearch, setMemberSearch] = useState('');

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

  useEffect(() => {
    Promise.all([getProjects({ limit: 500 }), getStudents({ limit: 1000 })])
      .then(([projRes, stuRes]) => {
        const projList = projRes.projects || [];
        setProjects(projList);
        const map = {};
        projList.forEach((p) => {
          map[p._id] = p.title;
        });
        setProjectMap(map);

        const stuList = stuRes.students || [];
        setStudents(stuList);
        setBatchOptions([...new Set(stuList.map((s) => s.batch).filter(Boolean))]);
      })
      .catch((err) => console.error('Failed to fetch reference data:', err));
  }, []);

  const openCreate = () => {
    setEditingTeam(null);
    setFormValues(emptyForm);
    setFormErrors({});
    setMemberSearch('');
    setIsFormOpen(true);
  };

  const openEdit = async (team) => {
    setEditingTeam(team);
    setFormValues({ ...emptyForm, name: team.name, batch: team.batch || '', projectId: team.projectId || '', leader: team.leader || '' });
    setFormErrors({});
    setMemberSearch('');
    setIsFormOpen(true);

    try {
      const fullTeam = await getTeamById(team._id);
      const memberIds = (fullTeam.members || []).map((m) => m._id || m.id);
      setFormValues({
        name: fullTeam.name,
        batch: fullTeam.batch || '',
        projectId: fullTeam.project?._id || fullTeam.projectId || '',
        members: memberIds,
        leader: fullTeam.leader || '',
      });
    } catch (error) {
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

  const filteredMemberStudents = useMemo(() => {
    const lower = memberSearch.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(lower) || (s.email && s.email.toLowerCase().includes(lower)),
    );
  }, [students, memberSearch]);

  const renderSelectedMembers = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return 'Select members';
    return students
      .filter((s) => selectedIds.includes(s._id || s.id))
      .map((s) => s.name)
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
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-3">
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
            Create a new team, assign a project, and define members and leadership.
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

            <Select
              label="Batch (Optional)"
              value={formValues.batch}
              onChange={(next) => setField('batch')({ target: { value: next } })}
              options={batchOptions.map((b) => ({ label: b, value: b }))}
              placeholder="None"
            />

            <Select
              label="Project (Optional)"
              value={formValues.projectId}
              onChange={(next) => setField('projectId')({ target: { value: next } })}
              options={projects.map((p) => ({ label: p.title, value: p._id || p.id }))}
              placeholder="None"
            />

            <div className="space-y-1.5 sm:col-span-2">
              <Label>
                Team Members
                <span className="text-destructive"> *</span>
              </Label>
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search students..."
                    className="h-9 bg-card pl-9"
                  />
                </div>
                <div className="max-h-48 space-y-0.5 overflow-y-auto">
                  {filteredMemberStudents.map((student) => {
                    const sId = student._id || student.id;
                    const checked = formValues.members.includes(sId);
                    return (
                      <button
                        key={sId}
                        type="button"
                        onClick={() => toggleMember(sId)}
                        className="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-left hover:bg-accent"
                      >
                        <Checkbox checked={checked} />
                        <span className="text-sm text-foreground">{student.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {formErrors.members && <p className="text-xs font-medium text-destructive">{formErrors.members}</p>}
              {formValues.members.length > 0 && (
                <p className="text-xs text-muted-foreground">{renderSelectedMembers(formValues.members)}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Select
                label="Team Leader"
                value={formValues.leader}
                onChange={(next) => setField('leader')({ target: { value: next } })}
                options={students
                  .filter((s) => formValues.members.includes(s._id || s.id))
                  .map((s) => ({ label: s.name, value: s._id || s.id }))}
                placeholder={formValues.members.length === 0 ? 'Select members first' : 'Select team leader'}
                error={formErrors.leader}
                disabled={formValues.members.length === 0}
                required
              />
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
