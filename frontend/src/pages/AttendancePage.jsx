import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Avatar } from '../components/ui/Avatar';
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar name={row.original.studentName} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.studentName}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.studentEmail}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: 'batch',
      header: 'BATCH',
      cell: ({ getValue }) => <Typography variant="body2">{getValue() || '—'}</Typography>,
    },
    {
      accessorKey: 'date',
      header: 'DATE',
      cell: ({ getValue }) => <Typography variant="body2">{String(getValue()).slice(0, 10)}</Typography>,
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val) {
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontStyle: 'italic' }}>
              Not Marked
            </Typography>
          );
        }
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              textTransform: 'capitalize',
              color: val === 'present' ? 'success.main' : 'error.main',
            }}
          >
            {val}
          </Typography>
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={currentStatus === 'present' ? 'contained' : 'outlined'}
              color="success"
              disabled={isLoading}
              onClick={() => handleStatusChange(row.original, 'present')}
              sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: 'capitalize' }}
            >
              Present
            </Button>
            <Button
              size="small"
              variant={currentStatus === 'absent' ? 'contained' : 'outlined'}
              color="error"
              disabled={isLoading}
              onClick={() => handleStatusChange(row.original, 'absent')}
              sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: 'capitalize' }}
            >
              Absent
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Daily Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track student attendance records.
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={{ p: 3, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Total Present</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>{summary.present}</Typography>
          </Box>
          <CalendarCheck size={40} color="#22C55E" opacity={0.2} />
        </Paper>
        <Paper elevation={0} sx={{ p: 3, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Total Absent</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>{summary.absent}</Typography>
          </Box>
          <CalendarCheck size={40} color="#ef4444" opacity={0.2} />
        </Paper>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search student..." />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            label="Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          {batchOptions.length > 0 && (
            <FilterBar
              label="All Batches"
              value={batchFilter}
              onChange={setBatchFilter}
              options={batchOptions.map((b) => ({ label: b, value: b }))}
            />
          )}
        </Box>
      </Box>

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
    </Box>
  );
}
