import { Avatar, Box, Card, CardContent, CardHeader, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { FolderOpen, Users } from 'lucide-react';
import { useTeam } from '../../hooks/useStudentPortal.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import dayjs from 'dayjs';

const StudentTeam = () => {
  const team = useTeam();

  if (team.isLoading) return <LoadingState />;
  if (team.isError) return <ErrorState message={team.error?.response?.data?.message} onRetry={() => team.refetch()} />;

  const data = team.data;
  if (!data?.team) {
    return <EmptyState message="You are not assigned to a team yet." />;
  }

  const { team: teamInfo, members } = data;
  const project = teamInfo.projectId;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        My Team — {teamInfo.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<Users size={20} color="#1976d2" />}
              title="Team Members"
              titleTypographyProps={{ variant: 'h6' }}
              subheader={`${members.length} member${members.length === 1 ? '' : 's'}`}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              {members.length === 0 ? (
                <EmptyState message="No team members found." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Member</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Batch</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((m) => (
                        <TableRow key={m._id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: 'primary.main' }}>
                                {(m.name || m.email || '?').charAt(0).toUpperCase()}
                              </Avatar>
                              {m.name}
                            </Stack>
                          </TableCell>
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

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<FolderOpen size={20} color="#1976d2" />}
              title="Team Project"
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: '#F4F9FF' }}
            />
            <CardContent>
              {project ? (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{project.title}</Typography>
                    <Badge status={project.status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {project.description || 'No description provided.'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Deadline:</strong>{' '}
                    {project.deadline ? dayjs(project.deadline).format('MMM D, YYYY') : 'Not set'}
                  </Typography>
                </Stack>
              ) : (
                <EmptyState message="No project linked to this team yet." />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box />
    </Stack>
  );
};

export default StudentTeam;
