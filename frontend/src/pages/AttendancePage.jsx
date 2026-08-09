import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Paper, Switch } from '@mui/material';
import { FileDown, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Avatar } from '../components/ui/Avatar';

// Dummy data
const DUMMY_ATTENDANCE = [
  { id: '1', studentId: 's1', name: 'Maya Lin', email: 'maya.lin@student.dev', batch: 'Batch 12 - Web Dev', date: '2026-08-09', status: 'present' },
  { id: '2', studentId: 's2', name: 'John Doe', email: 'john.d@student.dev', batch: 'Batch 12 - Web Dev', date: '2026-08-09', status: 'absent' },
  { id: '3', studentId: 's3', name: 'Sarah Smith', email: 'sarah@smit.edu', batch: 'Batch 11 - Full Stack', date: '2026-08-09', status: 'present' },
];

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-08-09');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(DUMMY_ATTENDANCE);

  const filteredRecords = records.filter(r => {
    if (batchFilter && r.batch !== batchFilter) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`Marked as ${newStatus}`);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'STUDENT',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar name={row.original.name} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: 'batch',
      header: 'BATCH',
      cell: ({ getValue }) => <Typography variant="body2">{getValue()}</Typography>,
    },
    {
      accessorKey: 'date',
      header: 'DATE',
      cell: ({ getValue }) => <Typography variant="body2">{getValue()}</Typography>,
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
          onChange={() => handleToggle(row.original.id, row.original.status)}
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
        <Button 
          variant="outlined" 
          startIcon={<FileDown size={18} />}
        >
          Export Report
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={{ p: 3, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Total Present</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>{records.filter(r => r.status === 'present').length}</Typography>
          </Box>
          <CalendarCheck size={40} color="#22C55E" opacity={0.2} />
        </Paper>
        <Paper elevation={0} sx={{ p: 3, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Total Absent</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>{records.filter(r => r.status === 'absent').length}</Typography>
          </Box>
          <CalendarCheck size={40} color="#ef4444" opacity={0.2} />
        </Paper>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search student..." />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FilterBar 
            label="Date" 
            value={dateFilter} 
            onChange={setDateFilter} 
            options={[{ label: 'Today (Aug 9)', value: '2026-08-09' }]} 
          />
          <FilterBar 
            label="All Batches" 
            value={batchFilter} 
            onChange={setBatchFilter} 
            options={[
              { label: 'Batch 12 - Web Dev', value: 'Batch 12 - Web Dev' },
              { label: 'Batch 11 - Full Stack', value: 'Batch 11 - Full Stack' }
            ]} 
          />
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable data={filteredRecords} columns={columns} />

      <Pagination 
        page={page} 
        totalPages={1} 
        totalItems={filteredRecords.length}
        onChange={setPage} 
      />
    </Box>
  );
}
