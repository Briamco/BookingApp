import { Eye, EyeOff, Mail, Lock, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useToast } from "../../context/ToastContext";
import { authService } from "../../services/AuthService";

function RegisterForm() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;

    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      addToast("error", "Passwords do not match");
      setIsSubmitting(false)
      return;
    }

    try {
      const response = await authService.register({ firstName, lastName, phone, email, password })

      addToast('success', response.message || 'Registered successfully. Please check your email to confirm your account.')
      navigate('/auth/login')
    } catch (error: any) {
      addToast('error', error.response?.data || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card card-xl w-full max-w-xl border border-base-300 bg-base-100/95 shadow-xl">
      <div className="card-body p-6 sm:p-8">
        <div className="mb-2 space-y-1 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Create your account</h2>
          <p className="text-sm text-base-content/70">Join BookingApp to start hosting or booking stays.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="register-first-name" className="text-sm font-medium">
                First name
              </label>
              <input
                type="text"
                id="register-first-name"
                name="firstName"
                required
                className="input input-bordered w-full"
                placeholder="Joe"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                autoComplete="given-name"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="register-last-name" className="text-sm font-medium">
                Last name
              </label>
              <input
                type="text"
                id="register-last-name"
                name="lastName"
                required
                className="input input-bordered w-full"
                placeholder="Smith"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                autoComplete="family-name"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="register-phone" className="text-sm font-medium">
              Phone
            </label>
            <label htmlFor="register-phone" className="input input-bordered flex w-full items-center gap-2">
              <Phone className="h-5 w-5 text-base-content/60" />
              <input
                type="tel"
                id="register-phone"
                name="phone"
                required
                className="grow"
                placeholder="809-555-1234"
                onChange={handlePhoneChange}
                value={phone}
                inputMode="numeric"
                maxLength={12}
                autoComplete="tel"
                disabled={isSubmitting}
              />
            </label>
          </div>

          <div className="space-y-1">
            <label htmlFor="register-email" className="text-sm font-medium">
              Email
            </label>
            <label htmlFor="register-email" className="input input-bordered flex w-full items-center gap-2">
              <Mail className="h-5 w-5 text-base-content/60" />
              <input
                type="email"
                id="register-email"
                name="email"
                required
                className="grow"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="register-password" className="text-sm font-medium">
                Password
              </label>
              <label htmlFor="register-password" className="input input-bordered flex w-full items-center gap-2">
                <Lock className="h-5 w-5 text-base-content/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password"
                  name="password"
                  required
                  className="grow"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </label>
            </div>

            <div className="space-y-1">
              <label htmlFor="register-confirm-password" className="text-sm font-medium">
                Confirm password
              </label>
              <label htmlFor="register-confirm-password" className="input input-bordered flex w-full items-center gap-2">
                <Lock className="h-5 w-5 text-base-content/60" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="register-confirm-password"
                  name="confirmPassword"
                  required
                  className="grow"
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          <div className="text-center text-sm text-base-content/70">
            Already have an account?{" "}
            <Link to="/auth/login" className="link link-primary font-medium" aria-disabled={isSubmitting}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm;