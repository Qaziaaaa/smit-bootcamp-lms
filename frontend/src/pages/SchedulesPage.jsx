import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { Plus, Edit2, Trash2, CalendarDays, Clock } from 'lucide-react';
import { ScheduleForm } from '../components/schedules/ScheduleForm';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([
    {
      id: '1',
      name: 'Agentic AI Weekend Batch',
      activeDays: ['Fri', 'Sat'],
      startTime: '11:00',
      endTime: '13:00',
    },
    {
      id: '2',
      name: 'Web Dev Weekday Batch',
      activeDays: ['Mon', 'Wed', 'Fri'],
      startTime: '09:00',
      endTime: '11:00',
    }
  ]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleCreateOrUpdate = (data) => {
    if (editingSchedule) {
      setSchedules(schedules.map(sch => sch.id === editingSchedule.id ? { ...sch, ...data } : sch));
    } else {
      const newSchedule = {
        id: `sch-${Date.now()}`,
        ...data,
      };
      setSchedules([...schedules, newSchedule]);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      setSchedules(schedules.filter(sch => sch.id !== id));
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setTimeout(() => setEditingSchedule(null), 200);
  };

  // Utility to format 24h time to 12h time (e.g. "13:00" -> "01:00 PM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarDays size={28} color="#2D69EB" /> Class Schedules
          </Typography>
          <Typography sx={{ color: '#828283', mt: 0.5, fontSize: 14 }}>
            Manage the active days and timings for all bootcamp classes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setIsFormOpen(true)}
          startIcon={<Plus size={18} />}
          sx={{
            bgcolor: '#2D69EB',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
            '&:hover': { bgcolor: '#1E40AF' }
          }}
        >
          Create Schedule
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#F8FAFA' }}>
            <TableRow>
              <TableCell sx={{ color: '#828283', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', py: 2 }}>Schedule Name</TableCell>
              <TableCell sx={{ color: '#828283', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', py: 2 }}>Active Days</TableCell>
              <TableCell sx={{ color: '#828283', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', py: 2 }}>Timings</TableCell>
              <TableCell align="right" sx={{ color: '#828283', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#828283' }}>
                  No schedules found. Click "Create Schedule" to add one.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F8FAFA' } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#0A0A0A', fontSize: 14 }}>
                      {schedule.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {schedule.activeDays.map(day => (
                        <Chip key={day} label={day} size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: 11, height: 22 }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontSize: 13, fontWeight: 500 }}>
                      <Clock size={14} color="#64748B" />
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(schedule)}
                        sx={{ color: '#2D69EB', bgcolor: '#F4F9FF', '&:hover': { bgcolor: '#DBEAFE' } }}
                      >
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(schedule.id)}
                        sx={{ color: '#DC2626', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Form */}
      <ScheduleForm 
        open={isFormOpen} 
        onClose={handleClose} 
        onSubmit={handleCreateOrUpdate} 
        defaultValues={editingSchedule} 
      />
    </Box>
  );
}
