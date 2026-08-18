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
      <div className="w-full p-3">
        <p className="text-sm text-muted-foreground">Loading student...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full p-3">
        <p className="text-sm text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const statusForBadge = student.status === 'inactive' ? 'inactive' : 'active';
  const displaySummary = summary.totalDays > 0 ? summary : { percentage: 0, present: 0, totalDays: 0 };

  return (
    <div className="flex flex-col gap-3 p-3 overflow-x-hidden">

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

      {/* Top Profile Card */}
      <div className="w-full min-w-0 max-w-full rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:items-center">
          {/* Profile */}
          <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-3 lg:col-span-2">
            <Avatar
              name={student.name}
              className="h-12 w-12 shrink-0 text-lg sm:h-14 sm:w-14 sm:text-xl"
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Student</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {student.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {student.email}
              </p>
            </div>
          </div>

          {/* Roll No */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Roll No</p>
            <p className="mt-1 truncate font-mono text-sm font-semibold text-foreground">
              {student.rollNo ||
                student.rollNumber ||
                (student._id
                  ? `STU-${String(student._id).slice(-4).toUpperCase()}`
                  : '—')}
            </p>
          </div>

          {/* Phone */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="mt-1 truncate text-sm text-foreground">
              {student.phone || '—'}
            </p>
          </div>

          {/* Batch */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Batch</p>
            <p className="mt-1 truncate text-sm text-foreground">
              {student.batch || '—'}
            </p>
          </div>

          {/* Team */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Team</p>
            <p className="mt-1 truncate text-sm text-foreground">
              {student.teamId?.name || 'Unassigned'}
            </p>
          </div>

          {/* Status */}
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge status={statusForBadge} />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary — matches information card width */}
      <div className="w-full min-w-0 max-w-full rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarCheck size={22} className="text-clr-blue" />
          <h2 className="text-base font-semibold text-foreground">Attendance Summary</h2>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between">
              <p className="text-sm font-semibold text-foreground">Attendance Percentage</p>
              <p className={cn('text-sm font-semibold', displaySummary.percentage >= 80 ? 'text-clr-green-dark' : 'text-clr-amber-dark')}>
                {displaySummary.percentage}%
              </p>
            </div>
            <Progress value={displaySummary.percentage} className="h-2" />
          </div>
          <div className="shrink-0 text-center sm:border-l sm:pl-4 sm:pr-2">
            <p className="text-2xl font-semibold text-foreground">
              {displaySummary.present} <span className="text-base text-muted-foreground">/ {displaySummary.totalDays}</span>
            </p>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Classes Attended
            </p>
          </div>
        </div>

        <h3 className="mb-2 text-sm font-semibold text-foreground">Recent History</h3>
        <div className="max-h-60 overflow-y-auto overflow-x-hidden rounded-md border bg-card">
          {history.length === 0 ? (
            <div className="p-3 text-center">
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            </div>
          ) : (
            history.map((record, index) => (
              <div key={record._id || index} className={cn('flex items-center justify-between p-2.5', index < history.length - 1 && 'border-b')}>
                <p className="text-sm font-medium text-foreground">{record.date ? new Date(record.date).toLocaleDateString() : '—'}</p>
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
