import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Select, MenuItem, FormControl } from '@mui/material';
import { UserPlus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StudentForm } from '../components/students/StudentForm';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../services/studentsService';
import { getTeams } from '../services/teamsService';

export default function StudentsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [page, setPage] = useState(1);

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (batchFilter) params.batch = batchFilter;
      const result = await getStudents(params);
      setStudents(result.students || []);
      setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, batchFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    getTeams()
      .then((result) => setTeams(result.teams || []))
      .catch(() => setTeams([]));
  }, []);

  const batchOptions = [...new Set(students.map((s) => s.batch).filter(Boolean))];

  const columns = [
    {
      accessorKey: 'name',
      header: 'STUDENT',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar name={row.original.name} />
          <Box>
            <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{row.original.name}</Typography>
            <Typography sx={{ color: '#64748B', fontSize: '13px', mt: 0.25 }}>{row.original.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: 'rollNo',
      header: 'ROLL NO',
      cell: ({ getValue }) => <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', textTransform: 'uppercase' }}>{getValue() || '—'}</Typography>,
    },
    {
      accessorKey: 'batch',
      header: 'BATCH',
      cell: ({ getValue }) => <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>{getValue() || '—'}</Typography>,
    },
    {
      accessorKey: 'teamId',
      header: 'TEAM',
      cell: ({ getValue }) => (
        <Typography sx={{ color: '#64748B', fontSize: '13px' }}>{getValue()?.name || 'Unassigned'}</Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(`/students/${row.original._id}`)}>
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
            onClick={() => setDeleteId(row.original._id)}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleSaveStudent = async (data) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, data);
        toast.success('Student updated successfully');
      } else {
        await createStudent(data);
        toast.success('Student created successfully');
      }
      await fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
      throw error;
    }
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(deleteId);
      toast.success('Student deleted successfully');
      setDeleteId(null);
      await fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Student Roster
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Manage student enrollments, status, and team assignments.
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
          sx={{
            bgcolor: '#2D69EB',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            '&:hover': { bgcolor: '#1E40AF' }
          }}
        >
          Add New Student
        </Button>
      </Box>

      {/* Search & Filters Container */}
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
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search student by name or roll no..." />
        <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '44px',
                color: '#2D69EB',
                fontWeight: 500,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2D69EB',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2D69EB',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2D69EB',
                },
                '& .MuiSelect-icon': {
                  color: '#64748B', // the dropdown icon color in template is greyish
                }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="graduated">Graduated</MenuItem>
            </Select>
          </FormControl>
          
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

      {/* Data Table Container */}
      <Box sx={{
        bgcolor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        '& .MuiTableContainer-root': {
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
        },
        '& .MuiTableHead-root': {
          bgcolor: '#F8FAFC',
          '& .MuiTableCell-root': {
            color: '#64748B',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            py: 2,
            borderBottom: '1px solid #E2E8F0',
          }
        },
        '& .MuiTableBody-root': {
          '& .MuiTableCell-root': {
            py: 2.5,
            borderBottom: '1px solid #E2E8F0',
          }
        }
      }}>
        <DataTable
          data={students}
          columns={columns}
          isLoading={loading}
          emptyMessage="No students found"
        />

        {/* Pagination Wrapper */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#ffffff' }}>
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onChange={setPage}
          />
        </Box>
      </Box>

      <StudentForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveStudent}
        initialData={editingStudent}
        batchOptions={batchOptions}
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
