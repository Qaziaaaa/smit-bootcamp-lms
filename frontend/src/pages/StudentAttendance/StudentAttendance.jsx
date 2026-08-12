import { Box, Card, CardContent, CardHeader, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useAttendance } from '../../hooks/useStudentPortal.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import dayjs from 'dayjs';

const StudentAttendance = () => {
  const attendance = useAttendance();

  const summary = attendance.data?.summary;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        My Attendance
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        <StatCard
          icon={<CalendarCheck size={22} />}
          label="Attendance %"
          value={summary ? `${summary.percentage}%` : '—'}
        />
        <StatCard icon={<CheckCircle2 size={22} color="#2e7d32" />} label="Present" value={summary?.present ?? '—'} />
        <StatCard icon={<XCircle size={22} color="#d32f2f" />} label="Absent" value={summary?.absent ?? '—'} />
      </Box>

      {summary && summary.totalDays > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Attendance rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={summary.percentage}
                color={summary.percentage >= 75 ? 'success' : 'warning'}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {summary.present} of {summary.totalDays} days present
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title="Attendance History" titleTypographyProps={{ variant: 'h6' }} sx={{ bgcolor: '#F4F9FF' }} />
        {attendance.isLoading ? (
          <Box sx={{ p: 2 }}>
            <LoadingState />
          </Box>
        ) : attendance.isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState message={attendance.error?.response?.data?.message} onRetry={() => attendance.refetch()} />
          </Box>
        ) : !attendance.data?.records?.length ? (
          <EmptyState message="No attendance records yet." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.data.records.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>{dayjs(record.date).format('MMM D, YYYY')}</TableCell>
                    <TableCell>
                      <StatusChip status={record.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
      <Box />
    </Stack>
  );
};

export default StudentAttendance;
