import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FilterBar } from '../components/ui/FilterBar';
import { toast } from 'sonner';

const DUMMY_TEAM = {
  id: '1',
  name: 'Team Alpha',
  project: 'LMS Web App',
  status: 'active',
  members: [
    { id: 's1', name: 'Maya Lin', email: 'maya@student.dev', role: 'Lead' },
    { id: 's3', name: 'Sarah Smith', email: 'sarah@smit.edu', role: 'Member' },
  ]
};

const AVAILABLE_STUDENTS = [
  { id: 's2', name: 'John Doe', email: 'john@student.dev' },
  { id: 's4', name: 'Mike Ross', email: 'mike@smit.edu' },
];

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(DUMMY_TEAM);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  const handleAssign = async () => {
    if (!selectedStudent) return;
    const student = AVAILABLE_STUDENTS.find(s => s.id === selectedStudent);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 500));
    setTeam({
      ...team,
      members: [...team.members, { ...student, role: 'Member' }]
    });
    toast.success(`${student.name} assigned to team`);
    setIsAssignOpen(false);
    setSelectedStudent('');
  };

  const handleRemoveMember = async (memberId) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 500));
    setTeam({
      ...team,
      members: team.members.filter(m => m.id !== memberId)
    });
    toast.success("Member removed from team");
  };

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
                <Typography variant="body2">{team.project || 'None'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}><Badge status={team.status} /></Box>
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
                  key={member.id} 
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
                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ bgcolor: 'primary.50', color: 'primary.main', px: 1, py: 0.5, borderRadius: 1, fontWeight: 600 }}>
                      {member.role}
                    </Typography>
                    <IconButton edge="end" size="small" color="error" onClick={() => handleRemoveMember(member.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </ListItemSecondaryAction>
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
          <FilterBar 
            label="Select Student" 
            value={selectedStudent} 
            onChange={setSelectedStudent}
            minWidth="100%"
            options={AVAILABLE_STUDENTS.map(s => ({ label: `${s.name} (${s.email})`, value: s.id }))}
          />
        </Box>
      </Modal>

    </Box>
  );
}
