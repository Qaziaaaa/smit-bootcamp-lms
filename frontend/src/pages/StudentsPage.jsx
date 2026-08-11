import React, { useCallback, useEffect, useState } from 'react';
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
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: 'batch',
      header: 'BATCH',
      cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{getValue() || '—'}</Typography>,
    },
    {
      accessorKey: 'teamId',
      header: 'TEAM',
      cell: ({ getValue }) => (
        <Typography variant="body2" color="text.secondary">{getValue()?.name || 'Unassigned'}</Typography>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Student Roster
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
        >
          Add New Student
        </Button>
      </Box>

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
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' }
            ]}
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

      <DataTable
        data={students}
        columns={columns}
        isLoading={loading}
        emptyMessage="No students found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        onChange={setPage}
      />

      <StudentForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveStudent}
        initialData={editingStudent}
        teams={teams}
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
