import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CalendarCheck, ClipboardList, FolderOpen, User, Users } from 'lucide-react';
import { useAttendance, useProfile, useTasks, useTeam } from '../../hooks/useStudentPortal.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import dayjs from 'dayjs';

const InfoRow = ({ label, value }) => (
  <ListItem disableGutters sx={{ px: 0 }}>
    <ListItemText
      primary={label}
      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
      secondary={value || '—'}
      secondaryTypographyProps={{ variant: 'body1', sx: { mt: 0.25 } }}
    />
  </ListItem>
);

const StudentProfile = () => {
  const profile = useProfile();
  const attendance = useAttendance();
  const team = useTeam();
  const tasks = useTasks();

  if (profile.isLoading) return <LoadingState />;
  if (profile.isError) return <ErrorState message={profile.error?.response?.data?.message} />;

  const p = profile.data || {};
  const initial = (p.name || p.email || 'S').charAt(0).toUpperCase();

  const tasksByStatus = (tasks.data || []).reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    { pending: 0, 'in-progress': 0, completed: 0 }
  );

  const members = team.data?.members || [];
  const project = team.data?.team?.projectId;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        My Profile
      </Typography>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Avatar sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 36 }}>
              {initial}
            </Avatar>
            <Stack spacing={0.5} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Typography variant="h5" fontWeight={600}>
                {p.name || 'Student'}
              </Typography>
              <Typography color="text.secondary">{p.email || '—'}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Badge status={p.status} />
                {p.teamId?.name && (
                  <Chip size="small" label={`Team: ${p.teamId.name}`} variant="outlined" />
                )}
                {p.batch && <Chip size="small" label={`Batch: ${p.batch}`} variant="outlined" />}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<User size={20} color="#1976d2" />}
              title="Personal Information"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              <List dense disablePadding>
                <InfoRow label="Email" value={p.email} />
                <Divider component="li" />
                <InfoRow label="Phone" value={p.phone} />
                <Divider component="li" />
                <InfoRow label="Batch" value={p.batch} />
                <Divider component="li" />
                <InfoRow label="Status" value={p.status} />
                <Divider component="li" />
                <InfoRow label="Joined" value={p.createdAt ? dayjs(p.createdAt).format('MMM D, YYYY') : '—'} />
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<CalendarCheck size={20} color="#1976d2" />}
              title="Attendance"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              {attendance.isLoading ? (
                <LoadingState />
              ) : attendance.isError ? (
                <ErrorState message={attendance.error?.response?.data?.message} />
              ) : attendance.data?.summary ? (
                <Stack spacing={2}>
                  <Typography variant="h3" fontWeight={700} color="primary">
                    {attendance.data.summary.percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {attendance.data.summary.present} present · {attendance.data.summary.absent} absent ·{' '}
                    {attendance.data.summary.totalDays} total days
                  </Typography>
                </Stack>
              ) : (
                <EmptyState message="No attendance records yet." />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<ClipboardList size={20} color="#1976d2" />}
              title="Task Summary"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              {tasks.isLoading ? (
                <LoadingState />
              ) : tasks.isError ? (
                <ErrorState message={tasks.error?.response?.data?.message} />
              ) : tasks.data?.length ? (
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Pending</Typography>
                    <Badge status="pending" />
                    <Typography variant="body1" fontWeight={600}>
                      {tasksByStatus.pending}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">In progress</Typography>
                    <Badge status="in-progress" />
                    <Typography variant="body1" fontWeight={600}>
                      {tasksByStatus['in-progress']}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Completed</Typography>
                    <Badge status="completed" />
                    <Typography variant="body1" fontWeight={600}>
                      {tasksByStatus.completed}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    Total: {tasks.data.length} task{tasks.data.length === 1 ? '' : 's'}
                  </Typography>
                </Stack>
              ) : (
                <EmptyState message="No tasks assigned yet." />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<FolderOpen size={20} color="#1976d2" />}
              title="My Project"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              {team.isLoading ? (
                <LoadingState />
              ) : team.isError ? (
                <ErrorState message={team.error?.response?.data?.message} />
              ) : team.data?.team ? (
                project ? (
                  <Stack spacing={1}>
                    <Typography variant="h6">{project.title}</Typography>
                    <Badge status={project.status} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {project.description || 'No description provided.'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Deadline:{' '}
                      {project.deadline ? dayjs(project.deadline).format('MMM D, YYYY') : 'Not set'}
                    </Typography>
                  </Stack>
                ) : (
                  <EmptyState message="No project linked to your team." />
                )
              ) : (
                <EmptyState message="You are not assigned to a team yet." />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<Users size={20} color="#1976d2" />}
              title="My Team Members"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              {team.isLoading ? (
                <LoadingState />
              ) : team.isError ? (
                <ErrorState message={team.error?.response?.data?.message} />
              ) : members.length === 0 ? (
                <EmptyState message="No team members yet." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Batch</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((m) => (
                        <TableRow key={m._id} hover>
                          <TableCell>{m.name}</TableCell>
                          <TableCell>{m.email}</TableCell>
                          <TableCell>{m.batch || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <ErrorState message={tasks.error?.response?.data?.message} onRetry={() => tasks.refetch()} />
          </Box>
        ) : !tasks.data?.length ? (
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
                {tasks.data.map((task) => (
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
      </Card>
      <Box />
    </Stack>
  );
};

export default StudentProfile;
