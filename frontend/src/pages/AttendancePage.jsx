import React, { useCallback, useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../lib/utils';
import { getAttendance, markAttendance, updateAttendance } from '../services/attendanceService';
import { getStudents } from '../services/studentsService';

function todayStr() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(todayStr());

  const [records, setRecords] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, notMarked: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRecords = useCallback(async () => {
    setInitialLoading(true);
    try {
      const params = { date: dateFilter, page: 1, limit: 500 };
      const result = await getAttendance(params);
      const marked = result.records || [];
      setRecords(marked);

      const present = marked.filter((r) => r.status === 'present').length;
      const absent = marked.filter((r) => r.status === 'absent').length;
      const notMarked = Math.max(0, allStudents.length - present - absent);
      setSummary({ present, absent, notMarked });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load attendance');
    } finally {
      setInitialLoading(false);
    }
  }, [dateFilter, allStudents.length]);

  useEffect(() => {
    fetchRecords();
  }, [dateFilter, fetchRecords]);

  useEffect(() => {
    getStudents({ limit: 500 })
      .then((result) => setAllStudents(result.students || []))
      .catch(() => setAllStudents([]));
  }, []);

  // Merge all students with attendance records — unmarked students appear with status: null
  const mergedRecords = allStudents.map((s) => {
    const record = records.find((r) => String(r.studentId || r._id) === String(s._id));
    return {
      studentId: s._id,
      studentName: s.name,
      studentEmail: s.email,
      rollNo: s.rollNo,
      batch: s.batch,
      date: dateFilter,
      status: record?.status || null,
      _id: record?._id || null,
    };
  });

  const filteredRecords = mergedRecords
    .filter((r) => {
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const name = (r.studentName || '').toLowerCase();
        const email = (r.studentEmail || '').toLowerCase();
        const roll = (r.rollNo || '').toLowerCase();
        return name.includes(q) || roll.includes(q) || email.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const getPriority = (item) => {
          const name = (item.studentName || '').toLowerCase();
          const roll = (item.rollNo || '').toLowerCase();
          if (name.startsWith(q) || roll.startsWith(q)) return 1;
          if (name.includes(q) || roll.includes(q)) return 2;
          return 3;
        };
        const pA = getPriority(a);
        const pB = getPriority(b);
        if (pA !== pB) return pA - pB;
        return (a.studentName || '').localeCompare(b.studentName || '');
      }
      return 0;
    });

  const handleStatusChange = async (record, targetStatus) => {
    if (record.status === targetStatus) return;
    const oldStatus = record.status;
    const targetKey = record._id || record.studentId;
    setTogglingId(targetKey);
    try {
      let result;
      if (record._id) {
        result = await updateAttendance(record._id, { status: targetStatus });
      } else {
        result = await markAttendance({ studentId: record.studentId, date: dateFilter, status: targetStatus });
      }
      const updatedId = result?._id || record._id;
      setRecords((prev) =>
        prev.map((r) => (r.studentId === record.studentId ? { ...r, _id: updatedId, status: targetStatus } : r))
      );
      setSummary((prev) => {
        let p = prev.present;
        let a = prev.absent;
        let nm = prev.notMarked;
        if (!oldStatus) nm = Math.max(0, nm - 1);
        else if (oldStatus === 'present') p = Math.max(0, p - 1);
        else if (oldStatus === 'absent') a = Math.max(0, a - 1);
        if (targetStatus === 'present') p += 1;
        else if (targetStatus === 'absent') a += 1;
        return { present: p, absent: a, notMarked: nm };
      });
      toast.success(`Marked as ${targetStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update attendance');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      accessorKey: 'studentName',
      header: 'STUDENT',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.original.studentName} />
          <div>
            <p className="text-sm font-semibold text-foreground">{row.original.studentName}</p>
            <p className="text-xs text-muted-foreground">{row.original.studentEmail}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rollNo',
      header: 'ROLL NO',
      cell: ({ row }) => {
        const roll = row.original.rollNo || '—';
        return <p className="text-sm font-semibold font-mono uppercase text-foreground">{roll}</p>;
      },
    },
    {
      accessorKey: 'date',
      header: 'DATE',
      cell: ({ getValue }) => <p className="text-sm text-foreground">{String(getValue()).slice(0, 10)}</p>,
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val) {
          return (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Marked
            </span>
          );
        }
        return (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
              val === 'present'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            )}
          >
            {val === 'present' ? 'Present' : 'Absent'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'MARK ATTENDANCE',
      cell: ({ row }) => {
        const itemKey = row.original._id || row.original.studentId;
        const currentStatus = row.original.status;
        const isLoading = togglingId === itemKey;

        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={currentStatus === 'present' ? 'success' : 'outline'}
              disabled={isLoading}
              onClick={() => handleStatusChange(row.original, 'present')}
              className="h-7 min-w-[70px] text-xs capitalize"
            >
              Present
            </Button>
            <Button
              size="sm"
              variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
              disabled={isLoading}
              onClick={() => handleStatusChange(row.original, 'absent')}
              className="h-7 min-w-[70px] text-xs capitalize"
            >
              Absent
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full min-w-0 max-w-full flex-col gap-2">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Daily Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track student attendance records.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex min-w-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Present</p>
            <p className="mt-1 text-2xl font-semibold text-clr-green-dark">{summary.present}</p>
          </div>
          <CalendarCheck size={36} className="shrink-0 text-clr-green opacity-20" />
        </div>
        <div className="flex min-w-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Absent</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">{summary.absent}</p>
          </div>
          <CalendarCheck size={36} className="shrink-0 text-destructive opacity-20" />
        </div>
        <div className="flex min-w-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">Not Marked</p>
            <p className="mt-1 text-2xl font-semibold text-muted-foreground">{summary.notMarked}</p>
          </div>
          <CalendarCheck size={36} className="shrink-0 text-muted-foreground opacity-20" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search student by name or roll no..." />
        <div className="ml-auto flex flex-wrap gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 w-[160px] max-w-[180px] rounded-md"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        isLoading={initialLoading}
        emptyMessage="No attendance records for the selected date"
        className="flex-1 min-h-0"
      />
    </div>
  );
}
