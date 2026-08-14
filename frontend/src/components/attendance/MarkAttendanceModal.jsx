import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '../ui/Badge';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  X,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Check,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar } from '../ui/Avatar';
import { getAttendance, markAttendance } from '../../services/attendanceService';

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
      const result = await getAttendance({ date: dateVal, limit: 500 });
      const rawRecords = result?.records || [];

      const formatted = rawRecords.map((r) => {
        const idStr = String(r.studentId || r._id || '');
        const shortId = idStr ? `STU-${idStr.slice(-5).toUpperCase()}` : 'STU-0000';

        return {
          studentId: r.studentId || r._id,
          name: r.studentName || 'Student',
          email: r.studentEmail || '',
          batch: r.batch || 'General',
          rollNumber: shortId,
          status: r.status || null, // 'present' | 'absent' | null
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
      // Priority 1: Name starts with search query (First name match, e.g. "Raza", "Raza Khan")
      if (name.startsWith(q)) return 1;

      // Priority 2: Any word in name starts with search query (Second/last name match, e.g. "Komal Raza")
      const words = name.split(/\s+/);
      if (words.some((w) => w.startsWith(q))) return 2;

      // Priority 3: Substring match anywhere in name
      if (name.includes(q)) return 3;

      // Priority 4: Match in roll number, email, or batch
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
    // Collect students with marked status ('present' or 'absent')
    const markedStudents = students.filter((s) => s.status === 'present' || s.status === 'absent');

    if (markedStudents.length === 0) {
      toast.info('No attendance status selected to save.');
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

      // Try bulk save API payload first
      try {
        await markAttendance({ records: recordsToSave });
      } catch (bulkErr) {
        // Fallback to sequential/parallel individual mark calls if bulk unsupported by legacy backend
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
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          m: 0,
          py: 1.5,
          px: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A0A0A', fontSize: 16 }}>
            Mark Attendance
          </Typography>
          <Typography variant="body2" sx={{ color: '#828283', mt: 0.1, fontSize: 12 }}>
            Update daily student attendance records.
          </Typography>
        </Box>
        <IconButton
          aria-label="close modal"
          onClick={onClose}
          disabled={saving}
          size="small"
          sx={{ ml: 'auto', p: 0.5, color: '#828283', '&:hover': { color: '#0A0A0A', bgcolor: '#F4F5F6' } }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          pt: '8px !important',
          pb: { xs: '16px !important', sm: '20px !important' },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* Controls Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            p: 1.5,
            bgcolor: '#F8FAFA',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: '#E5E7EB',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
            <TextField
              type="date"
              label="Date"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={loading || saving}
              sx={{
                width: { xs: '100%', sm: 160 },
                '& .MuiOutlinedInput-root': {
                  height: 38,
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  fontSize: '0.85rem',
                },
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              placeholder="Search by student name, ID, or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading || saving}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 200 },
                '& .MuiOutlinedInput-root': {
                  height: 38,
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  fontSize: '0.85rem',
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="#828283" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => handleMarkAll('present')}
              disabled={loading || saving || filteredStudents.length === 0}
              startIcon={<CheckCircle2 size={15} />}
              sx={{ textTransform: 'none', fontSize: 12, height: 38, px: 1.75, bgcolor: '#FFFFFF', borderRadius: '8px' }}
            >
              All Present
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleMarkAll('absent')}
              disabled={loading || saving || filteredStudents.length === 0}
              startIcon={<XCircle size={15} />}
              sx={{ textTransform: 'none', fontSize: 12, height: 38, px: 1.75, bgcolor: '#FFFFFF', borderRadius: '8px' }}
            >
              All Absent
            </Button>
          </Box>
        </Box>

        {/* Stats Pills & Save Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              avatar={<Users size={14} color="#2D69EB" />}
              label={`Total: ${counts.total}`}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F4F9FF', borderColor: 'rgba(45, 105, 235, 0.3)', color: '#2D69EB' }}
            />
            <Chip
              avatar={<CheckCircle2 size={14} color="#22C55E" />}
              label={`Present: ${counts.present}`}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#ECFDF5', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#15803D' }}
            />
            <Chip
              avatar={<XCircle size={14} color="#DC2626" />}
              label={`Absent: ${counts.absent}`}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FEF2F2', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#B91C1C' }}
            />
            {counts.pending > 0 && (
              <Chip
                avatar={<AlertCircle size={14} color="#D97706" />}
                label={`Unmarked: ${counts.pending}`}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FFFBEB', borderColor: 'rgba(217, 119, 6, 0.3)', color: '#B45309' }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
            <Typography variant="caption" sx={{ color: '#828283', fontWeight: 500, fontSize: 12 }}>
              {counts.present + counts.absent} of {counts.total} students marked
            </Typography>

            <Button
              onClick={handleSave}
              disabled={loading || saving}
              variant="contained"
              disableElevation
              startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <Check size={15} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                height: 34,
                fontSize: 12.5,
                borderRadius: '8px',
                bgcolor: '#0277BD',
                '&:hover': { bgcolor: '#01579B' },
              }}
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </Box>
        </Box>

        {/* Student List Section */}
        <Box
          sx={{
            minHeight: 280,
            maxHeight: 420,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            position: 'relative',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, gap: 2 }}>
              <CircularProgress size={32} thickness={4} />
              <Typography variant="body2" sx={{ color: '#828283', fontWeight: 500 }}>
                Loading student attendance list...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, gap: 1.5, textAlign: 'center' }}>
              <AlertCircle size={36} color="#DC2626" />
              <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshCw size={14} />}
                onClick={() => fetchAttendanceList(selectedDate)}
                sx={{ mt: 1 }}
              >
                Retry
              </Button>
            </Box>
          ) : filteredStudents.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#828283' }}>
                No student records found matching your query.
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: '#F3F4F6' }} />}>
              {filteredStudents.map((student) => {
                const isPresent = student.status === 'present';
                const isAbsent = student.status === 'absent';

                return (
                  <Box
                    key={student.studentId}
                    sx={{
                      py: 1,
                      px: { xs: 1.5, sm: 2 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.25,
                      bgcolor: isPresent ? 'rgba(236, 253, 245, 0.3)' : isAbsent ? 'rgba(254, 242, 242, 0.3)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: isPresent ? '#ECFDF5' : isAbsent ? '#FEF2F2' : '#F9FAFB' },
                    }}
                  >
                    {/* Student Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                      <Avatar name={student.name} sx={{ width: 32, height: 32, fontSize: 12 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }} noWrap>
                            {student.name}
                          </Typography>
                          <Chip
                            label={student.rollNumber}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 9.5,
                              fontWeight: 600,
                              bgcolor: '#F3F4F6',
                              color: '#374151',
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#828283' }} noWrap>
                          {student.batch}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Attendance Status & Action Buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                      {/* Current Status Badge */}
                      <Badge
                        status={isPresent ? 'present' : isAbsent ? 'absent' : 'not-marked'}
                        icon={isPresent ? CheckCircle2 : isAbsent ? XCircle : undefined}
                        sx={{
                          display: { xs: 'none', sm: 'inline-flex' },
                          border: '1px solid',
                          borderColor: isPresent ? 'rgba(34, 197, 94, 0.3)' : isAbsent ? 'rgba(239, 68, 68, 0.3)' : '#E5E7EB',
                        }}
                      />

                      {/* Toggle Button Group */}
                      <Box sx={{ display: 'flex', gap: 0.75 }}>
                        <Button
                          size="small"
                          variant={isPresent ? 'contained' : 'outlined'}
                          onClick={() => handleStatusChange(student.studentId, 'present')}
                          disabled={saving}
                          startIcon={<Check size={14} />}
                          sx={{
                            height: 32,
                            minWidth: 82,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            boxShadow: isPresent ? 'none' : 'none',
                            bgcolor: isPresent ? '#22C55E' : 'transparent',
                            borderColor: isPresent ? '#22C55E' : '#D1D5DB',
                            color: isPresent ? '#FFFFFF' : '#374151',
                            '&:hover': {
                              bgcolor: isPresent ? '#16A34A' : '#ECFDF5',
                              borderColor: isPresent ? '#16A34A' : '#22C55E',
                              color: isPresent ? '#FFFFFF' : '#15803D',
                            },
                          }}
                        >
                          Present
                        </Button>

                        <Button
                          size="small"
                          variant={isAbsent ? 'contained' : 'outlined'}
                          onClick={() => handleStatusChange(student.studentId, 'absent')}
                          disabled={saving}
                          startIcon={<X size={14} />}
                          sx={{
                            height: 32,
                            minWidth: 82,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            boxShadow: isAbsent ? 'none' : 'none',
                            bgcolor: isAbsent ? '#DC2626' : 'transparent',
                            borderColor: isAbsent ? '#DC2626' : '#D1D5DB',
                            color: isAbsent ? '#FFFFFF' : '#374151',
                            '&:hover': {
                              bgcolor: isAbsent ? '#B91C1C' : '#FEF2F2',
                              borderColor: isAbsent ? '#B91C1C' : '#DC2626',
                              color: isAbsent ? '#FFFFFF' : '#B91C1C',
                            },
                          }}
                        >
                          Absent
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
