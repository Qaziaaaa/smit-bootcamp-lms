import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Grid, Divider, IconButton, LinearProgress } from '@mui/material';
import { ArrowLeft, Edit2, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { StudentForm } from '../components/students/StudentForm';

// Dummy data
const DUMMY_STUDENT = {
  id: '1', name: 'Maya Lin', email: 'maya.lin@student.dev', phone: '+1234567890',
  batch: 'Batch 12 - Web Dev', team: 'Team Alpha', status: 'Active',
  attendanceSummary: {
    percentage: 85,
    present: 17,
    total: 20
  },
  attendanceHistory: [
    { date: '2026-08-01', status: 'present' },
    { date: '2026-07-31', status: 'absent' },
    { date: '2026-07-30', status: 'present' },
  ]
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [student, setStudent] = useState(DUMMY_STUDENT);

  const handleUpdate = async (data) => {
    // Simulate API update
    await new Promise(r => setTimeout(r, 500));
    setStudent({ ...student, ...data });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Topbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/students')} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Student — {student.name}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<Edit2 size={16} />}
          onClick={() => setIsFormOpen(true)}
        >
          Edit Profile
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar name={student.name} sx={{ width: 80, height: 80, fontSize: '2rem' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{student.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>{student.email}</Typography>
            <Badge status={student.status} sx={{ mt: 1, mb: 3 }} />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Phone</Typography>
                <Typography variant="body2">{student.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Batch</Typography>
                <Typography variant="body2">{student.batch}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Team</Typography>
                <Typography variant="body2">{student.team || 'Unassigned'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Attendance Summary */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CalendarCheck size={24} color="#2D69EB" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Attendance Summary</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Attendance Percentage</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: student.attendanceSummary.percentage >= 80 ? 'success.main' : 'warning.main' }}>
                    {student.attendanceSummary.percentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={student.attendanceSummary.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: student.attendanceSummary.percentage >= 80 ? 'success.main' : 'warning.main'
                    }
                  }} 
                />
              </Box>
              <Box sx={{ textAlign: 'center', px: 3, borderLeft: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {student.attendanceSummary.present} <span style={{ fontSize: '1rem', color: '#828283' }}>/ {student.attendanceSummary.total}</span>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                  Classes Attended
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Recent History</Typography>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
              {student.attendanceHistory.map((record, index) => (
                <Box key={record.date} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  borderBottom: index < student.attendanceHistory.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{record.date}</Typography>
                  {record.status === 'present' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                      <CheckCircle2 size={16} />
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>Present</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                      <XCircle size={16} />
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>Absent</Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>

          </Paper>
        </Grid>
      </Grid>

      <StudentForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={student}
        onSubmit={handleUpdate}
      />
    </Box>
  );
}
