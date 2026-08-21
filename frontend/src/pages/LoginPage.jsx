// Login Page — Handles user authentication for both Students and Admins.
// Provides tab-based switching, client-side input validation, error handling,
// password visibility toggle, and role-based post-login redirection.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";

export default function LoginPage() {
  // Auth context for authenticating credentials & setting session tokens
  const { login } = useAuth();
  const navigate = useNavigate();

  // Input refs for programmatic focus management
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Component state
  const [activeTab, setActiveTab] = useState(0); // 0 = Student login, 1 = Admin login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false); // Toggles password visibility between text and password
  const [fieldErrors, setFieldErrors] = useState({}); // Stores field validation error messages
  const [submitting, setSubmitting] = useState(false); // Tracks async login request in progress

  // Auto-focus email input on initial mount and when switching tabs
  useEffect(() => {
    emailInputRef.current?.focus();
  }, [activeTab]);

  // Redirect user to their designated dashboard after successful authentication
  function goHome(user) {
    navigate(user.role === "admin" ? "/dashboard" : "/student/dashboard", {
      replace: true,
      state: { justLoggedIn: true }, // Triggers one-time welcome toast in layout
    });
  }

  // Switches between Student and Admin tabs, clearing previous inputs and errors
  function switchTab(idx) {
    setActiveTab(idx);
    setEmail("");
    setPassword("");
    setFieldErrors({});
  }

  // Handles form submission: validates email/password, calls auth service, and manages error states
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    // Basic format and required validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Please enter a valid email.";
    if (!password) errs.password = "Password is required.";
    setFieldErrors(errs);

    // Focus the first invalid field and stop execution
    if (errs.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (errs.password) {
      passwordInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // Authenticate with backend API using selected role
      const user = await login(
        email.trim(),
        password,
        isStudent ? "student" : "admin",
      );
      goHome(user);
    } catch (err) {
      // Display friendly toast notification on authentication failure
      const status = err.response?.status;
      toast.error(
        status === 401
          ? "Invalid email or password."
          : err.response?.data?.message ||
              "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Boolean helper to check active role mode
  const isStudent = activeTab === 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-card px-4 py-6">
      <div className="w-full max-w-[420px]">
        {/* SMIT Branding & Logo Header */}
        <div className="mb-5 text-center">
          <img
            src="/logo.png"
            alt="SMIT – Saylani Mass IT Training"
            className="mx-auto inline-block h-auto w-24"
          />
          <p className="mt-1.5 text-base font-semibold text-clr-navy">
            Bootcamp LMS
          </p>
        </div>

        {/* Role Selection Tabs (Student / Admin) */}
        <div className="mb-2.5 flex gap-0.5 rounded-lg bg-muted p-1">
          {["Login as Student", "Login as Admin"].map((label, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => switchTab(idx)}
              className={cn(
                "flex-1 cursor-pointer rounded-md px-2 py-2 text-[0.85rem] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeTab === idx
                  ? "bg-card font-semibold text-clr-navy shadow-sm"
                  : "font-normal text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Login Form Container Card */}
        <div className="rounded-lg border bg-card p-5">
          {/* Form Header with Role-Specific Instructions */}
          <div className="mb-4">
            <h1 className="m-0 text-base font-bold text-foreground">Login</h1>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-clr-blue-dark">
              {isStudent
                ? "Kindly provide the email and password used during SMIT course registration."
                : "Enter your admin credentials to access the management dashboard."}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={emailInputRef}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={
                  isStudent ? "student@smit.edu.pk" : "admin@lms.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                className={cn(
                  fieldErrors.email &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <Label htmlFor="login-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={passwordInputRef}
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  className={cn(
                    "pr-10",
                    fieldErrors.password &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {/* Toggle password visibility button */}
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent p-0.5 text-muted-foreground"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="mt-1 bg-clr-navy py-2.5 font-bold uppercase tracking-wider text-white hover:bg-clr-blue-darker"
            >
              {submitting ? "Logging in..." : "LOGIN"}
            </Button>
          </form>
        </div>

        {/* Quick Role Switcher Button Below Card */}
        <button
          type="button"
          onClick={() => switchTab(isStudent ? 1 : 0)}
          className="mt-2.5 block w-full cursor-pointer rounded-lg border bg-card px-3 py-3 text-[0.88rem] font-medium text-clr-navy transition-colors hover:border-clr-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isStudent ? "Login as Admin" : "Login as Student"}
        </button>
      </div>
    </div>
  );
}
