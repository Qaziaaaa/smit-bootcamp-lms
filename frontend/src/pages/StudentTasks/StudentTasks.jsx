import { useState } from 'react';
import { toast } from 'sonner';
import {
  Box,
  Button,
  Card,
  CardHeader,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTasks, useUpdateTaskProgress } from '../../hooks/useStudentPortal.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import dayjs from 'dayjs';

const NEXT_STATUS = {
  pending: ['in-progress', 'completed'],
  'in-progress': ['completed'],
  completed: [],
};

const TaskRow = ({ task }) => {
  const [selected, setSelected] = useState('');
  const mutation = useUpdateTaskProgress();

  const options = NEXT_STATUS[task.status] || [];

  const handleUpdate = () => {
    if (!selected) return;
    mutation.mutate(
      { taskId: task._id, status: selected },
      {
        onSuccess: () => {
          toast.success(`Task moved to "${selected}".`);
          setSelected('');
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || 'Failed to update task progress.');
        },
      }
    );
  };

  return (
    <TableRow key={task._id} hover>
      <TableCell>
        <Typography variant="body1">{task.title}</Typography>
        {task.description && (
          <Typography variant="caption" color="text.secondary">
            {task.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>{task.projectId?.title || '—'}</TableCell>
      <TableCell>
        <StatusChip status={task.priority} />
      </TableCell>
      <TableCell>
        <StatusChip status={task.status} />
      </TableCell>
      <TableCell>{task.deadline ? dayjs(task.deadline).format('MMM D, YYYY') : '—'}</TableCell>
      <TableCell align="right">
        {options.length > 0 ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Select
              size="small"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              displayEmpty
              disabled={mutation.isPending}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="" disabled>
                Update to…
              </MenuItem>
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              size="small"
              disabled={!selected || mutation.isPending}
              onClick={handleUpdate}
            >
              {mutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No further updates
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

const StudentTasks = () => {
  const tasks = useTasks();
  const list = tasks.data || [];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        My Tasks
      </Typography>

      <Card>
        <CardHeader title="Assigned Tasks" titleTypographyProps={{ variant: 'h6' }} sx={{ bgcolor: '#F4F9FF' }} />
        {tasks.isLoading ? (
          <Box sx={{ p: 2 }}>
            <LoadingState />
          </Box>
        ) : tasks.isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState message={tasks.error?.response?.data?.message} onRetry={() => tasks.refetch()} />
          </Box>
        ) : list.length === 0 ? (
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
                  <TableCell align="right"><strong>Update</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((task) => (
                  <TaskRow key={task._id} task={task} />
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

export default StudentTasks;
