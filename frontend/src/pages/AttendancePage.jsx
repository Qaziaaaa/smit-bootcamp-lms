import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Paper, Switch, TextField, Select, MenuItem, FormControl } from '@mui/material';
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
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { date: dateFilter, page, limit: 10 };
      if (batchFilter) params.batch = batchFilter;
      if (search) params.search = search;
      const result = await getAttendance(params);
      setRecords(result.records || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, batchFilter, search, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    getStudents({ limit: 500 })
      .then((result) => setAllStudents(result.students || []))
      .catch(() => setAllStudents([]));
  }, []);

  const batchOptions = [...new Set(allStudents.map((s) => s.batch).filter(Boolean))];

  const filteredRecords = records.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.studentName?.toLowerCase().includes(q) && !r.studentEmail?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;

  const handleToggle = async (record, currentStatus) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    setTogglingId(record._id);
    try {
      if (record._id) {
        await updateAttendance(record._id, { status: newStatus });
      } else {
        await markAttendance({ studentId: record.studentId, date: dateFilter, status: newStatus });
      }
      setRecords((prev) => prev.map((r) => (r._id === record._id ? { ...r, status: newStatus } : r)));
      toast.success(`Marked as ${newStatus}`);
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
      cell: ({ getValue }) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            textTransform: 'capitalize',
            color: getValue() === 'present' ? 'success.main' : 'error.main'
          }}
        >
          {getValue()}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: 'MARK PRESENT',
      cell: ({ row }) => (
        <Switch
          checked={row.original.status === 'present'}
          disabled={togglingId === row.original._id}
          onChange={() => handleToggle(row.original, row.original.status)}
          color="success"
        />
      ),
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
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>{presentCount}</Typography>
          </Box>
          <CalendarCheck size={40} color="#22C55E" opacity={0.2} />
        </Paper>
        <Paper elevation={0} sx={{ p: 3, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Total Absent</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>{absentCount}</Typography>
          </Box>
          <CalendarCheck size={40} color="#ef4444" opacity={0.2} />
        </Paper>
      </Box>

      {/* Toolbar */}
      <Box sx={{
        bgcolor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '& .MuiTextField-root': {
          flex: 1,
          maxWidth: '380px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#ffffff',
            height: '44px',
          }
        }
      }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search student..." />
        <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <TextField
            type="date"
            size="small"
            label="Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              minWidth: '160px',
              maxWidth: '180px !important',
              '& .MuiOutlinedInput-root': {
                height: '44px !important',
                borderRadius: '8px',
              }
            }}
          />
          {batchOptions.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                displayEmpty
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  height: '44px',
                  '& .MuiSelect-icon': {
                    color: '#64748B',
                  }
                }}
              >
                <MenuItem value="">All Batches</MenuItem>
                {batchOptions.map((b) => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        isLoading={loading}
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
