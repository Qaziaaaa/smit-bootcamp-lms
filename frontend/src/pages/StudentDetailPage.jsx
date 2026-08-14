import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { StudentForm } from '../components/students/StudentForm';
import { getStudentById, updateStudent } from '../services/studentsService';
import { getAttendance, getAttendanceSummary } from '../services/attendanceService';
import { getTeams } from '../services/teamsService';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [summary, setSummary] = useState({ percentage: 0, present: 0, totalDays: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentRes, attendanceRes, summaryRes] = await Promise.all([
        getStudentById(id),
        getAttendance({ studentId: id, limit: 10 }),
        getAttendanceSummary(),
      ]);
      setStudent(studentRes);
      const ownSummary = (summaryRes.students || []).find((s) => String(s.studentId) === String(id));
      setSummary(
        ownSummary || { percentage: 0, present: 0, totalDays: 0, absent: 0 }
      );
      setHistory(attendanceRes.records || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    getTeams()
      .then((result) => setTeams(result.teams || []))
      .catch(() => setTeams([]));
  }, []);

  const handleUpdate = async (data) => {
    try {
      await updateStudent(id, data);
      toast.success('Student updated successfully');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update student');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] p-3">
        <p className="text-sm text-muted-foreground">Loading student...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-[1200px] p-3">
        <p className="text-sm text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const statusForBadge = student.status === 'inactive' ? 'inactive' : 'active';
  const displaySummary = summary.totalDays > 0 ? summary : { percentage: 0, present: 0, totalDays: 0 };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3 p-3">

      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Back to students" onClick={() => navigate('/students')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Student — {student.name}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFormOpen(true)}
        >
          <Edit2 size={16} />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-3">
        {/* Profile Card */}
        <div className="col-span-12 md:col-span-4">
          <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
            <div className="mb-2 flex justify-center">
              <Avatar name={student.name} className="h-20 w-20 text-2xl" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{student.name}</h2>
            <p className="mb-0.5 text-sm text-muted-foreground">{student.email}</p>
            <Badge status={statusForBadge} className="mb-3 mt-1" />

            <hr className="my-2 border-t" />

            <div className="flex flex-col gap-2 text-left">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Roll No</p>
                <p className="text-sm font-semibold uppercase font-mono text-foreground">{student.rollNo || student.rollNumber || (student._id ? `STU-${String(student._id).slice(-4).toUpperCase()}` : '—')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">{student.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Batch</p>
                <p className="text-sm text-foreground">{student.batch || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Team</p>
                <p className="text-sm text-foreground">{student.teamId?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="col-span-12 md:col-span-8">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CalendarCheck size={24} className="text-clr-blue" />
              <h2 className="text-base font-semibold text-foreground">Attendance Summary</h2>
            </div>

            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <p className="text-sm font-semibold text-foreground">Attendance Percentage</p>
                  <p className={cn('text-sm font-semibold', displaySummary.percentage >= 80 ? 'text-clr-green-dark' : 'text-clr-amber-dark')}>
                    {displaySummary.percentage}%
                  </p>
                </div>
                <Progress value={displaySummary.percentage} className="h-2" />
              </div>
              <div className="border-l px-3 text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {displaySummary.present} <span className="text-base text-muted-foreground">/ {displaySummary.totalDays}</span>
                </p>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Classes Attended
                </p>
              </div>
            </div>

            <h3 className="mb-2 text-sm font-semibold text-foreground">Recent History</h3>
            <div className="overflow-hidden rounded-md border bg-card">
              {history.length === 0 ? (
                <div className="p-3 text-center">
                  <p className="text-sm text-muted-foreground">No attendance records yet.</p>
                </div>
              ) : (
                history.map((record, index) => (
                  <div key={record._id} className={cn('flex items-center justify-between p-2', index < history.length - 1 && 'border-b')}>
                    <p className="text-sm font-medium text-foreground">{String(record.date).slice(0, 10)}</p>
                    {record.status === 'present' ? (
                      <span className="flex items-center gap-1 text-clr-green-dark">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-semibold capitalize">Present</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle size={16} />
                        <span className="text-sm font-semibold capitalize">Absent</span>
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      <StudentForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={student}
        onSubmit={handleUpdate}
        teams={teams}
      />
    </div>
  );
}
