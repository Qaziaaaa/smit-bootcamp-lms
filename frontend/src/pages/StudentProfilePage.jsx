import { useEffect, useState } from 'react';
import { Mail, User, Loader2 } from 'lucide-react';
import { getStudentProfile } from '../services/studentService';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

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
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Fallback data since backend doesn't store all these fields yet
  const student = profile || {};
  const name = student.name || 'Student Name';
  const rollNo = student.rollNo || student.rollNumber || (student._id ? `STU-${String(student._id).slice(-4).toUpperCase()}` : '—');
  const email = student.email || 'student@example.com';
  const batch = student.batch || 'Batch Not Assigned';
  const phone = student.phone || 'Not provided';
  const address = student.address || 'Not provided';
  const gender = student.gender || 'Not provided';
  const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided';
  const qualification = student.lastQualification || 'Not provided';
  const cnic = student.cnic || 'Not provided';

  return (
    <div className="flex flex-col gap-3">
      {/* Cover Image & Avatar Section */}
      <div className="relative mb-8">
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-clr-green-bg to-clr-blue-bg sm:h-50 md:h-60">
          <div className="scale-150 opacity-80">
            <Logo />
          </div>
        </div>

        <div className="absolute -bottom-[60px] left-6 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-clr-blue text-[48px] font-semibold text-white shadow-md sm:left-10">
          {student.profileImage ? (
            <img src={student.profileImage} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Name and Edit Action */}
      <div className="flex items-start justify-between px-1 sm:px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{name}</h2>
          <div className="mt-1 inline-flex rounded-md border border-border bg-muted px-1.5 py-0.5">
            <span className="text-[13px] font-medium text-clr-slate">Student</span>
          </div>
        </div>
        <Button className="rounded-lg px-3 font-semibold">Edit Profile</Button>
      </div>

      {/* Information Cards Grid */}
      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr]">

        {/* Contact Info Card */}
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5">
            <Mail size={18} className="text-clr-blue" />
            <h3 className="font-semibold text-foreground">Contact Info</h3>
          </div>

          <div className="grid gap-2.5">
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{email}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{phone}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium text-foreground">{address}</p>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5">
            <User size={18} className="text-clr-blue" />
            <h3 className="font-semibold text-foreground">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Roll No</p>
              <p className="text-sm font-semibold font-mono uppercase text-foreground">{rollNo}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Gender</p>
              <p className="text-sm font-medium text-foreground">{gender}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium text-foreground">{dob}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Last Qualification</p>
              <p className="text-sm font-medium text-foreground">{qualification}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">CNIC</p>
              <p className="text-sm font-medium text-foreground">{cnic}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Batch</p>
              <p className="text-sm font-medium text-foreground">{batch}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <ChangePasswordCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { changePassword } = await import('../services/studentService');
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-clr-blue"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <h3 className="font-semibold text-foreground">Change Password</h3>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Current Password</p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Current password"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">New Password</p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Confirm New Password</p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Repeat new password"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {error && <p className="text-xs text-destructive sm:col-span-3">{error}</p>}
        {success && <p className="text-xs text-green-600 sm:col-span-3">{success}</p>}
        <div className="sm:col-span-3 flex justify-end">
          <Button type="submit" disabled={submitting} className="rounded-lg px-4 font-semibold">
            {submitting ? 'Saving...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
