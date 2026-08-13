import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FilterBar } from '../components/ui/FilterBar';
import { getTeamById, assignStudentsToTeam } from '../services/teamsService';
import { getStudents } from '../services/studentsService';

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTeamById(id);
      setTeam(result);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const fetchAvailableStudents = useCallback(async () => {
    try {
      const result = await getStudents({ limit: 500 });
      const memberIds = new Set((team?.members || []).map((m) => String(m._id)));
      setAvailableStudents(
        (result.students || []).filter((s) => !memberIds.has(String(s._id)))
      );
    } catch {
      toast.error('Failed to load available students');
    }
  }, [team]);

  useEffect(() => {
    if (isAssignOpen) {
      fetchAvailableStudents();
      setSelectedStudent('');
    }
  }, [isAssignOpen, fetchAvailableStudents]);

  const handleAssign = async () => {
    if (!selectedStudent) return;
    try {
      await assignStudentsToTeam(id, [selectedStudent]);
      toast.success('Student assigned to team');
      setIsAssignOpen(false);
      await fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign student');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="body2" color="text.secondary">Loading team...</Typography>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="body2" color="text.secondary">Team not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Topbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/teams')} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Team — {team.name}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<UserPlus size={16} />} onClick={() => setIsAssignOpen(true)}>
          Assign Student
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Team Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 2 }}>Team Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Team Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{team.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Assigned Project</Typography>
                <Typography variant="body2">{team.project?.title || 'None'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Project Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  {team.project ? <Badge status={team.project.status} /> : <Typography variant="body2" color="text.secondary">—</Typography>}
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Members</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{team.members.length}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Members */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Team Members ({team.members.length})</Typography>
            </Box>
            <List disablePadding>
              {team.members.map((member, index) => (
                <ListItem
                  key={member._id}
                  divider={index < team.members.length - 1}
                  sx={{ py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar name={member.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{member.name}</Typography>}
                    secondary={member.email}
                  />
                  <Badge status={member.status} />
                </ListItem>
              ))}
              {team.members.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No members in this team yet.
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Assign Modal */}
      <Modal
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Student to Team"
        actions={
          <>
            <Button onClick={() => setIsAssignOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleAssign} color="primary" variant="contained" disabled={!selectedStudent} disableElevation>Assign</Button>
          </>
        }
      >
        <Box sx={{ pt: 1 }}>
          {availableStudents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No unassigned students available.</Typography>
          ) : (
            <FilterBar
              label="Select Student"
              value={selectedStudent}
              onChange={setSelectedStudent}
              minWidth="100%"
              options={availableStudents.map((s) => ({ label: `${s.name} (${s.email})`, value: s._id }))}
            />
          )}
        </Box>
      </Modal>

    </Box>
  );
}
