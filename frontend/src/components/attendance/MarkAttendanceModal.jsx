import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import {
  X,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Check,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toastInfo } from '../../lib/toast';

import { getAttendance, markAttendance } from '../../services/attendanceService';
import { getStudents } from '../../services/studentsService';

function todayStr() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function MarkAttendanceModal({ open, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendanceList = useCallback(async (dateVal) => {
    setLoading(true);
    setError(null);
    try {
      const [resAttendance, resStudents] = await Promise.all([
        getAttendance({ date: dateVal, limit: 500 }),
        getStudents({ limit: 500 }),
      ]);
      const rawRecords = resAttendance?.records || [];
      const allStudents = resStudents?.students || [];

      const formatted = rawRecords.map((r) => {
        const sId = String(r.studentId || r._id || '');
        const studentObj = allStudents.find((s) => String(s._id || s.id) === sId);
        const actualRoll = r.rollNo || r.rollNumber || studentObj?.rollNo || studentObj?.rollNumber;
        const shortId = sId ? `STU-${sId.slice(-4).toUpperCase()}` : 'STU-0000';

        return {
          studentId: r.studentId || r._id,
          name: r.studentName || studentObj?.name || 'Student',
          email: r.studentEmail || studentObj?.email || '',
          batch: r.batch || studentObj?.batch || 'General',
          rollNumber: actualRoll || shortId,
          status: r.status || null,
          originalStatus: r.status || null,
        };
      });

      setStudents(formatted);
    } catch (err) {
      console.error('Error fetching attendance list:', err);
      setError(err.response?.data?.message || 'Failed to load student attendance list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedDate(todayStr());
      setSearch('');
      fetchAttendanceList(todayStr());
    }
  }, [open, fetchAttendanceList]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (newDate) {
      fetchAttendanceList(newDate);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents((prev) =>
      prev.map((st) => (st.studentId === studentId ? { ...st, status } : st))
    );
  };

  const handleMarkAll = (targetStatus) => {
    const targetStudentIds = new Set(filteredStudents.map((s) => s.studentId));
    setStudents((prev) =>
      prev.map((st) =>
        targetStudentIds.has(st.studentId) ? { ...st, status: targetStatus } : st
      )
    );
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();

    const getMatchPriority = (student) => {
      const name = (student.name || '').toLowerCase();
      if (name.startsWith(q)) return 1;

      const words = name.split(/\s+/);
      if (words.some((w) => w.startsWith(q))) return 2;

      if (name.includes(q)) return 3;

      const roll = (student.rollNumber || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      const batch = (student.batch || '').toLowerCase();
      if (roll.includes(q) || email.includes(q) || batch.includes(q)) return 4;

      return 999;
    };

    return students
      .filter((s) => getMatchPriority(s) !== 999)
      .sort((a, b) => {
        const pA = getMatchPriority(a);
        const pB = getMatchPriority(b);
        if (pA !== pB) {
          return pA - pB;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [students, search]);

  const counts = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === 'present').length;
    const absent = students.filter((s) => s.status === 'absent').length;
    const pending = total - (present + absent);
    return { total, present, absent, pending };
  }, [students]);

  const handleSave = async () => {
    const markedStudents = students.filter((s) => s.status === 'present' || s.status === 'absent');

    if (markedStudents.length === 0) {
      toastInfo('No attendance status selected to save.');
      onClose();
      return;
    }

    setSaving(true);
    try {
      const recordsToSave = markedStudents.map((s) => ({
        studentId: s.studentId,
        date: selectedDate,
        status: s.status,
      }));

      try {
        await markAttendance({ records: recordsToSave });
      } catch {
        await Promise.all(
          recordsToSave.map((rec) => markAttendance(rec))
        );
      }

      toast.success('Attendance saved successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save attendance:', err);
      toast.error(err.response?.data?.message || 'Failed to save attendance records.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      title="Mark Attendance"
    >
      <p className="mb-3 text-xs text-muted-foreground">
        Update daily student attendance records.
      </p>

      {/* Controls Toolbar */}
      <div className="mb-3 flex flex-col justify-between gap-1.5 rounded-lg border border-border bg-muted p-1.5 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap gap-1.5">
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            disabled={loading || saving}
            className="h-[38px] w-full rounded-md bg-card sm:w-[160px]"
          />

          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name, ID, or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading || saving}
              className="h-[38px] rounded-md bg-card pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll('present')}
            disabled={loading || saving || filteredStudents.length === 0}
            className="h-[38px] rounded-md bg-card px-1.75 text-xs text-clr-green-dark"
          >
            <CheckCircle2 size={15} />
            All Present
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll('absent')}
            disabled={loading || saving || filteredStudents.length === 0}
            className="h-[38px] rounded-md bg-card px-1.75 text-xs text-destructive"
          >
            <XCircle size={15} />
            All Absent
          </Button>
        </div>
      </div>

      {/* Stats Pills & Save Button */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.25">
          <Badge status="info" label={`Total: ${counts.total}`} icon={Users} />
          <Badge status="success" label={`Present: ${counts.present}`} icon={CheckCircle2} />
          <Badge status="error" label={`Absent: ${counts.absent}`} icon={XCircle} />
          {counts.pending > 0 && (
            <Badge status="warning" label={`Unmarked: ${counts.pending}`} icon={AlertCircle} />
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {counts.present + counts.absent} of {counts.total} students marked
          </p>

          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="h-[34px] rounded-md px-2.5 text-[12.5px] font-semibold"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={15} />
                Save Attendance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Student List Section */}
      <div className="relative max-h-[420px] min-h-[280px] overflow-y-auto rounded-md border border-border bg-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading student attendance list...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-1.5 p-6 text-center">
            <AlertCircle size={36} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">
              {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAttendanceList(selectedDate)}
              className="mt-1"
            >
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No student records found matching your query.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredStudents.map((student) => {
              const isPresent = student.status === 'present';
              const isAbsent = student.status === 'absent';

              return (
                <li
                  key={student.studentId}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-1.25 px-1.5 py-1 transition-colors duration-150 sm:px-2',
                    isPresent
                      ? 'bg-clr-emerald-bg/30 hover:bg-clr-emerald-bg'
                      : isAbsent
                        ? 'bg-clr-rose-bg/30 hover:bg-clr-rose-bg'
                        : 'hover:bg-muted',
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1.25">
                    <Avatar name={student.name} className="h-8 w-8 text-xs" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {student.name}
                        </p>
                        <span className="inline-flex h-[18px] items-center rounded bg-muted px-1 text-[9.5px] font-mono font-semibold text-foreground">
                          {student.rollNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge
                      status={isPresent ? 'present' : isAbsent ? 'absent' : 'not-marked'}
                      icon={isPresent ? CheckCircle2 : isAbsent ? XCircle : undefined}
                      className="hidden sm:inline-flex"
                    />

                    <div className="flex gap-0.75">
                      <Button
                        size="sm"
                        variant={isPresent ? 'success' : 'outline'}
                        onClick={() => handleStatusChange(student.studentId, 'present')}
                        disabled={saving}
                        className={cn(
                          'h-8 min-w-[82px] text-xs font-semibold',
                          !isPresent && 'text-clr-green-dark',
                        )}
                      >
                        <Check size={14} />
                        Present
                      </Button>

                      <Button
                        size="sm"
                        variant={isAbsent ? 'destructive' : 'outline'}
                        onClick={() => handleStatusChange(student.studentId, 'absent')}
                        disabled={saving}
                        className={cn(
                          'h-8 min-w-[82px] text-xs font-semibold',
                          !isAbsent && 'text-destructive',
                        )}
                      >
                        <X size={14} />
                        Absent
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
