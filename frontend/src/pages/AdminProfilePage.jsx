import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Avatar, Chip } from '@mui/material';
import { Mail, Phone, Shield, Plus, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/ui/Logo';
import { AdminForm } from '../components/admin/AdminForm';

export default function AdminProfilePage() {
  const { user } = useAuth();
  
  // Local state for mock admins. Initialize with the Admin.
  const [admins, setAdmins] = useState([
    {
      id: 'admin-1',
      name: user?.name || 'Admin',
      email: user?.email || 'admin@saylani.org',
      phone: '0300 1234567',
      role: 'Admin',
      profileImage: ''
    }
  ]);
  
  const superAdmin = admins[0];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cover Image & Avatar Section */}
      <Box sx={{ position: 'relative', mb: 8 }}>
        <Box
          sx={{
            height: { xs: 160, sm: 200, md: 240 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1E40AF 0%, #2D69EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ transform: 'scale(1.5)', opacity: 0.9, filter: 'brightness(0) invert(1)' }}>
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
            bgcolor: '#ffffff',
            border: '4px solid #ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2D69EB',
            fontSize: 48,
            fontWeight: 700,
            overflow: 'hidden'
          }}
        >
          {superAdmin.profileImage ? (
            <img src={superAdmin.profileImage} alt={superAdmin.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            superAdmin.name.charAt(0).toUpperCase()
          )}
        </Box>
      </Box>

      {/* Name and Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: { xs: 1, sm: 2 } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            {superAdmin.name}
          </Typography>
          <Box sx={{ display: 'inline-flex', mt: 1, px: 1.5, py: 0.5, bgcolor: '#DBEAFE', borderRadius: 1, border: '1px solid #BFDBFE' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>
              {superAdmin.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Admin Info Card */}
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#ffffff', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Shield size={18} color="#2D69EB" />
          <Typography sx={{ fontWeight: 600, color: '#0A0A0A' }}>Profile Details</Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Mail size={14} /> Email
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{superAdmin.email}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone size={14} /> Phone
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{superAdmin.phone}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Shield size={14} /> Role
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>{superAdmin.role}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Key size={14} /> Password
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#0A0A0A', fontWeight: 500 }}>********</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Management Section for Listed Admins */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, px: 1 }}>
          Platform Administrators
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {admins.map((adm) => (
            <Paper key={adm.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={adm.profileImage} sx={{ width: 48, height: 48, bgcolor: adm.role === 'Admin' ? '#1E40AF' : '#2D69EB' }}>
                {adm.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {adm.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#828283', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {adm.email}
                </Typography>
                <Chip 
                  label={adm.role} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: 10, 
                    fontWeight: 600, 
                    bgcolor: adm.role === 'Admin' ? '#DBEAFE' : '#F1F5F9',
                    color: adm.role === 'Admin' ? '#1E40AF' : '#475569'
                  }} 
                />
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
