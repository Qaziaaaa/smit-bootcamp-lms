import React, { useCallback, useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
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
  const [batchFilter, setBatchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(todayStr());
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [allStudents, setAllStudents] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRecords = useCallback(async (isSearchChange = false) => {
    if (!isSearchChange) {
      setInitialLoading(true);
    }
    try {
      const params = { date: dateFilter, page, limit: 10 };
      if (batchFilter) params.batch = batchFilter;
      if (search) params.search = search;
      const result = await getAttendance(params);
      setRecords(result.records || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
      if (result.summary) {
        setSummary(result.summary);
      } else {
        const p = (result.records || []).filter((r) => r.status === 'present').length;
        const a = (result.records || []).filter((r) => r.status === 'absent').length;
        setSummary({ present: p, absent: a });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load attendance');
    } finally {
      setInitialLoading(false);
    }
  }, [dateFilter, batchFilter, search, page]);

  useEffect(() => {
    const isSearchChange = Boolean(search);
    fetchRecords(isSearchChange);
  }, [dateFilter, batchFilter, search, page]);

  useEffect(() => {
    getStudents({ limit: 500 })
      .then((result) => setAllStudents(result.students || []))
      .catch(() => setAllStudents([]));
  }, []);

  const batchOptions = [...new Set(allStudents.map((s) => s.batch).filter(Boolean))];

  const filteredRecords = records
    .filter((r) => {
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        if (!r.studentName?.toLowerCase().startsWith(q)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (search && search.trim()) {
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
        if (oldStatus === 'present') p = Math.max(0, p - 1);
        if (oldStatus === 'absent') a = Math.max(0, a - 1);
        if (targetStatus === 'present') p += 1;
        if (targetStatus === 'absent') a += 1;
        return { present: p, absent: a };
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
      accessorKey: 'batch',
      header: 'BATCH',
      cell: ({ getValue }) => <p className="text-sm text-foreground">{getValue() || '—'}</p>,
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
            <p className="text-sm font-semibold italic text-muted-foreground">
              Not Marked
            </p>
          );
        }
        return (
          <p
            className={cn(
              'text-sm font-semibold capitalize',
              val === 'present' ? 'text-clr-green-dark' : 'text-destructive',
            )}
          >
            {val}
          </p>
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
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3 p-3">

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
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Present</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.present}</p>
          </div>
          <CalendarCheck size={40} className="text-clr-green opacity-20" />
        </div>
        <div className="flex flex-1 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Absent</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.absent}</p>
          </div>
          <CalendarCheck size={40} className="text-destructive opacity-20" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search student..." />
        <div className="ml-auto flex flex-wrap gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 w-[160px] max-w-[180px] rounded-md"
          />
          {batchOptions.length > 0 && (
            <FilterBar
              label="Batch"
              value={batchFilter}
              onChange={(next) => setBatchFilter(next)}
              options={batchOptions.map((b) => ({ label: b, value: b }))}
            />
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        isLoading={initialLoading}
        emptyMessage="No attendance records for the selected date"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        onChange={setPage}
      />
    </div>
  );
}
