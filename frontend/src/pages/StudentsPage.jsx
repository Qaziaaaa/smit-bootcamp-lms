import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { UserPlus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StudentForm } from '../components/students/StudentForm';

// Dummy data to simulate backend response until API is integrated
const DUMMY_STUDENTS = [
  { id: '1', name: 'Maya Lin', email: 'maya.lin@student.dev', batch: 'Batch 12 - Web Dev', team: 'Team Alpha', status: 'Active', attendance: 95 },
  { id: '2', name: 'John Doe', email: 'john.d@student.dev', batch: 'Batch 12 - Web Dev', team: 'Unassigned', status: 'Inactive', attendance: 78 },
  { id: '3', name: 'Sarah Smith', email: 'sarah@smit.edu', batch: 'Batch 11 - Full Stack', team: 'Team Beta', status: 'Active', attendance: 100 },
];

export default function StudentsPage() {
  const navigate = useNavigate();
  
  // State for search and filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Filter dummy data
  const filteredStudents = DUMMY_STUDENTS.filter(s => {
    if (statusFilter && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (batchFilter && s.batch !== batchFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
      cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{getValue()}</Typography>,
    },
    {
      accessorKey: 'team',
      header: 'TEAM',
      cell: ({ getValue }) => <Typography variant="body2" color="text.secondary">{getValue()}</Typography>,
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'attendance',
      header: 'ATTENDANCE',
      cell: ({ getValue }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ w: '64px', h: '8px', bgcolor: 'grey.200', borderRadius: '4px', overflow: 'hidden', minWidth: 64 }}>
            <Box sx={{ width: `${getValue()}%`, height: '100%', bgcolor: getValue() >= 80 ? 'success.main' : 'warning.main' }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{getValue()}%</Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(`/students/${row.original.id}`)}>
            <Eye size={18} />
          </IconButton>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => {
              setEditingStudent(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSaveStudent = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(editingStudent ? "Student updated successfully" : "Student created successfully");
  };

  const handleDeleteStudent = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Student deleted successfully");
    setDeleteId(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Student Roster
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student enrollments, status, attendance ratings, and team assignments.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<UserPlus size={18} />}
          disableElevation
          onClick={() => {
            setEditingStudent(null);
            setIsFormOpen(true);
          }}
        >
          Add New Student
        </Button>
      </Box>

      {/* Toolbar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 2, 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search student by name or email..." />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FilterBar 
            label="All Statuses" 
            value={statusFilter} 
            onChange={setStatusFilter} 
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]} 
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
      <DataTable 
        data={filteredStudents} 
        columns={columns} 
      />

      <Pagination 
        page={page} 
        totalPages={Math.ceil(DUMMY_STUDENTS.length / 10)} 
        totalItems={DUMMY_STUDENTS.length}
        onChange={setPage} 
      />

      {/* Modals */}
      <StudentForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSaveStudent}
        initialData={editingStudent}
      />

      <ConfirmDialog 
        open={!!deleteId} 
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={handleDeleteStudent}
        onCancel={() => setDeleteId(null)}
      />

    </Box>
  );
}
