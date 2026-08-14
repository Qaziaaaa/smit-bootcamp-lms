import { Box, Card, CardHeader, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { CalendarCheck, FolderOpen, Percent, Users } from 'lucide-react';
import { useAttendance, useProfile, useTasks, useTeam } from '../../hooks/useStudentPortal.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatCard from '../../components/StatCard.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import dayjs from 'dayjs';

const StudentDashboard = () => {
  const profile = useProfile();
  const attendance = useAttendance();
  const team = useTeam();
  const tasks = useTasks();

  if (profile.isLoading) return <LoadingState />;
  if (profile.isError) return <ErrorState message={profile.error?.response?.data?.message} />;

  const name = profile.data?.name || 'Student';

  const teamName = team.data?.team?.name;
  const projectTitle = team.data?.team?.projectId?.title;
  const attendancePercent = attendance.data?.summary?.percentage;
  const taskList = tasks.data || [];
  const recentTasks = taskList.slice(0, 5);

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Welcome, {name}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        <StatCard
          icon={<Percent size={22} />}
          label="Attendance"
          value={attendance.data ? `${attendancePercent}%` : '—'}
          sub={attendance.data?.summary ? `${attendance.data.summary.present}/${attendance.data.summary.totalDays} days present` : undefined}
        />
        <StatCard icon={<Users size={22} />} label="My Team" value={teamName || '—'} />
        <StatCard icon={<FolderOpen size={22} />} label="My Project" value={projectTitle || '—'} />
      </Box>

      <Card>
        <CardHeader
          title="My Tasks"
          titleTypographyProps={{ variant: 'h6' }}
          sx={{ bgcolor: '#F4F9FF' }}
        />
        {tasks.isLoading ? (
          <Box sx={{ p: 2 }}>
            <LoadingState />
          </Box>
        ) : tasks.isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState
              message={tasks.error?.response?.data?.message}
              onRetry={() => tasks.refetch()}
            />
          </Box>
        ) : taskList.length === 0 ? (
          <EmptyState message="No tasks assigned yet." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Task</strong></TableCell>
                  <TableCell><strong>Project</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Deadline</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTasks.map((task) => (
                  <TableRow key={task._id} hover>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.projectId?.title || '—'}</TableCell>
                    <TableCell>
                      <Badge status={task.priority} />
                    </TableCell>
                    <TableCell>
                      <Badge status={task.status} />
                    </TableCell>
                    <TableCell>
                      {task.deadline ? dayjs(task.deadline).format('MMM D, YYYY') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!tasks.isLoading && !tasks.isError && taskList.length > 5 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {recentTasks.length} of {taskList.length} tasks
            </Typography>
          </Box>
        )}
      </Card>
      <Box />
    </Stack>
  );
};

export default StudentDashboard;
