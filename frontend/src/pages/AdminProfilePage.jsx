import React, { useState } from 'react';
import { Mail, Phone, Shield, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/ui/Logo';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

export default function AdminProfilePage() {
  const { user } = useAuth();
  
  const [admins] = useState([
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
    <div className="flex flex-col gap-3">
      {/* Cover Image & Avatar Section */}
      <div className="relative mb-8">
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg sm:h-[200px] md:h-60 bg-[linear-gradient(135deg,hsl(var(--clr-blue-dark)),hsl(var(--clr-blue)))]">
          <div className="scale-150 opacity-90 brightness-0 invert">
            <Logo />
          </div>
        </div>
        
        <div className="absolute -bottom-15 left-6 flex h-30 w-30 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-card text-5xl font-bold text-clr-blue shadow-md sm:left-10">
          {superAdmin.profileImage ? (
            <img src={superAdmin.profileImage} alt={superAdmin.name} className="h-full w-full object-cover" />
          ) : (
            superAdmin.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Name and Action */}
      <div className="flex items-start justify-between px-1 sm:px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {superAdmin.name}
          </h1>
          <span className="mt-1 inline-flex rounded-md border border-clr-blue-border bg-clr-blue-bg px-1.5 py-0.5">
            <span className="text-[13px] font-semibold text-clr-blue-dark">
              {superAdmin.role}
            </span>
          </span>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="mt-2 rounded-lg border bg-card p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-1.5">
          <Shield size={18} className="text-clr-blue" />
          <p className="text-base font-semibold text-foreground">Profile Details</p>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="mb-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
              <Mail size={14} /> Email
            </p>
            <p className="text-sm font-medium text-foreground">{superAdmin.email}</p>
          </div>
          <div>
            <p className="mb-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
              <Phone size={14} /> Phone
            </p>
            <p className="text-sm font-medium text-foreground">{superAdmin.phone}</p>
          </div>
          <div>
            <p className="mb-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
              <Shield size={14} /> Role
            </p>
            <p className="text-sm font-medium text-foreground">{superAdmin.role}</p>
          </div>
          <div>
            <p className="mb-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
              <Key size={14} /> Password
            </p>
            <p className="text-sm font-medium text-foreground">********</p>
          </div>
        </div>
      </div>

      {/* Management Section for Listed Admins */}
      <div className="mt-2">
        <h2 className="mb-2 px-1 text-base font-semibold text-foreground">
          Platform Administrators
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {admins.map((adm) => (
            <div key={adm.id} className="flex items-center gap-2 rounded-lg border bg-card p-2.5 shadow-sm">
              <Avatar name={adm.name} className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {adm.name}
                </p>
                <p className="mb-0.5 truncate text-xs text-muted-foreground">
                  {adm.email}
                </p>
                <Badge status={adm.role.toLowerCase()} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
