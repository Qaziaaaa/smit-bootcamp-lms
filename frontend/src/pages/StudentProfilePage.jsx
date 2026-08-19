import { useEffect, useState } from 'react';
import { Mail, User, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getStudentProfile, changeStudentPassword } from '../services/studentService';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error('Current password is required');
      return;
    }
    if (password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await changeStudentPassword({ oldPassword, password, confirmPassword });
      toast.success('Password changed successfully');
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Cover Image & Avatar Section */}
      <div className="relative mb-16 sm:mb-20">
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-clr-green-bg to-clr-blue-bg sm:h-50 md:h-60">
          <div className="scale-150 opacity-80">
            <Logo />
          </div>
        </div>

        <div className="absolute -bottom-14 left-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-clr-blue text-4xl font-semibold text-white shadow-md sm:-bottom-16 sm:left-10 sm:h-32 sm:w-32 sm:text-5xl">
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
      <div className="mt-2 rounded-xl border bg-card p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-1.5">
          <KeyRound size={18} className="text-clr-blue" />
          <h3 className="font-semibold text-foreground">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="old-password">
              Current Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((p) => !p)}
                tabIndex={-1}
                aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent p-0.5 text-muted-foreground"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">
              New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent p-0.5 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent p-0.5 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Saving...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
