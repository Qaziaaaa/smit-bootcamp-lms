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

    </div>
  );
}
