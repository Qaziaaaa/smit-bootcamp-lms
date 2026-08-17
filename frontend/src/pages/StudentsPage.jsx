import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserPlus, Edit2, Trash2, Eye, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { StudentForm } from '../components/students/StudentForm';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
} from '../services/studentsService';

export default function StudentsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [page, setPage] = useState(1);

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const batchOptions = [...new Set(students.map((s) => s.batch).filter(Boolean))];

  const columns = [
    {
      accessorKey: 'name',
      header: 'STUDENT',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.original.name} />
          <div>
            <p className="text-sm font-semibold text-foreground">{row.original.name}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rollNo',
      header: 'ROLL NO',
      cell: ({ row }) => {
        const roll = row.original.rollNo || row.original.rollNumber || (row.original._id ? `STU-${String(row.original._id).slice(-4).toUpperCase()}` : '—');
        return <p className="text-[13px] font-semibold uppercase font-mono text-foreground">{roll}</p>;
      },
    },
    {
      accessorKey: 'batch',
      header: 'BATCH',
      cell: ({ getValue }) => <p className="text-[13px] font-semibold text-foreground">{getValue() || '—'}</p>,
    },
    {
      accessorKey: 'teamId',
      header: 'TEAM',
      cell: ({ getValue }) => (
        <p className="text-[13px] text-muted-foreground">{getValue()?.name || 'Unassigned'}</p>
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
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View student" onClick={() => navigate(`/students/${row.original._id}`)}>
            <Eye size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-clr-blue"
            aria-label="Edit student"
            onClick={() => {
              setEditingStudent(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            aria-label="Delete student"
            onClick={() => setDeleteId(row.original._id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      ),
    },
  ];

  const handleSaveStudent = async (data) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, data);
        toast.success('Student updated successfully');
      } else {
        const result = await createStudent(data);
        const pwd = result?.generatedPassword || 'N/A';
        toast.success(`Student created. Password: ${pwd}`, { duration: 10000 });
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

  const handleBulkImport = async () => {
    if (!importFile) {
      toast.error('Please select a CSV file');
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const result = await bulkImportStudents(formData);
      const msg = `Imported ${result.created} students.` + (result.errors?.length ? ` ${result.errors.length} errors.` : '');
      toast.success(msg, { duration: 8000 });
      if (result.errors?.length) {
        console.warn('Import errors:', result.errors);
      }
      setIsImportOpen(false);
      setImportFile(null);
      await fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import students');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-2 sm:p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Student Roster
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage student enrollments, status, and team assignments.
          </p>
        </div>
        <Button
          variant="default"
          className="rounded-md px-3 py-1 font-semibold"
          onClick={() => {
            setEditingStudent(null);
            setIsFormOpen(true);
          }}
        >
          <UserPlus size={18} />
          Add New Student
        </Button>
        <Button
          variant="outline"
          className="rounded-md px-3 py-1 font-semibold"
          onClick={() => setIsImportOpen(true)}
        >
          <Upload size={18} />
          Import CSV
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search student by name or roll no..." />
        <div className="ml-auto flex flex-wrap gap-2">
          <FilterBar
            label="Status"
            value={statusFilter}
            onChange={(next) => setStatusFilter(next)}
            options={[
              { label: 'Pending', value: 'Pending' },
              { label: 'Enrolled', value: 'Enrolled' },
              { label: 'Dropout', value: 'Dropout' },
              { label: 'Completed', value: 'Completed' },
            ]}
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

      <div className="overflow-hidden rounded-lg border bg-card">
        <DataTable
          data={students}
          columns={columns}
          isLoading={loading}
          emptyMessage="No students found"
          className="border-0 rounded-none"
        />

        <div className="border-t bg-card p-2">
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onChange={setPage}
          />
        </div>
      </div>

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

      <Modal
        open={isImportOpen}
        onClose={() => { setIsImportOpen(false); setImportFile(null); }}
        title="Import Students from CSV"
        hideDividers
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV file with columns: <strong>name</strong>, <strong>email</strong>, and optionally <strong>phone</strong>, <strong>batch</strong>, <strong>rollNo</strong>. All imported students will have the default password.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {importFile ? importFile.name : 'Choose CSV File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            {importFile && (
              <button
                type="button"
                onClick={() => setImportFile(null)}
                className="text-sm text-destructive hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsImportOpen(false); setImportFile(null); }} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport} disabled={!importFile || importing}>
              {importing ? 'Importing...' : 'Import Students'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
