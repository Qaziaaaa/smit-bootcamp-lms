import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Mail, User } from 'lucide-react';
import { getStudentProfile } from '../services/studentService';
import { Logo } from '../components/ui/Logo';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getStudentProfile()
      .then((data) => {
        if (mounted) setProfile(data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Fallback data since backend doesn't store all these fields yet
  const student = profile || {};
  const name = student.name || 'Student Name';
  const email = student.email || 'student@example.com';
  const batch = student.batch || 'Batch Not Assigned';
  const phone = student.phone || 'Not provided';
  const address = student.address || 'Not provided';
  const gender = student.gender || 'Not provided';
  const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided';
  const qualification = student.lastQualification || 'Not provided';
  const cnic = student.cnic || 'Not provided';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cover Image & Avatar Section */}
      <Box sx={{ position: 'relative', mb: 8 }}>
        <Box
          sx={{
            height: { xs: 160, sm: 200, md: 240 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #c3e6cb 0%, #a4d4f2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ transform: 'scale(1.5)', opacity: 0.8 }}>
            <Logo />
          </Box>
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: { xs: 24, sm: 40 },
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: '#2D69EB',
            border: '4px solid #ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 48,
            fontWeight: 600,
            overflow: 'hidden'
          }}
        >
          {student.profileImage ? (
            <img src={student.profileImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </Box>
      </Box>

      {/* Name and Edit Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: { xs: 1, sm: 2 } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            {name}
          </Typography>
          <Box sx={{ display: 'inline-flex', mt: 1, px: 1.5, py: 0.5, bgcolor: '#F1F5F9', borderRadius: 1, border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>
              Student
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#2D69EB',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
            '&:hover': { bgcolor: '#1E40AF' }
          }}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Information Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mt: 2 }}>
        
        {/* Contact Info Card */}
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Mail size={18} color="#2D69EB" />
            <Typography sx={{ fontWeight: 600, color: '#0A0A0A' }}>Contact Info</Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Email</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{email}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Phone</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{phone}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Address</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{address}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Personal Information Card */}
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <User size={18} color="#2D69EB" />
            <Typography sx={{ fontWeight: 600, color: '#0A0A0A' }}>Personal Information</Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Gender</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{gender}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Date of Birth</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{dob}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Last Qualification</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{qualification}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>CNIC</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{cnic}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5 }}>Batch</Typography>
              <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{batch}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
}
