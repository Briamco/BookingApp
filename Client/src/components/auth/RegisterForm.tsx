import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
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

    if (password !== confirmPassword) {
      addToast("error", "Passwords do not match");
      return;
    }

    try {
      const response = await authService.register({ firstName, lastName, phone, email, password })

      addToast('success', response.message || 'Registered successfully. Please check your email to confirm your account.')
      navigate('/auth/login')
    } catch (error: any) {
      addToast('error', error.response?.data || 'Registration failed')
    }
  }

  return (
    <div className="card card-xl bg-base-100 w-96 shadow-md">
      <div className="card-body">
        <h2 className="card-title">Register</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <label htmlFor="email" className="input">
            First Name
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="grow"
              placeholder="Joe"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </label>
          <label htmlFor="email" className="input">
            Last Name
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="grow"
              placeholder="Smith"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </label>
          <label htmlFor="email" className="input">
            <Phone className="w-5 h-5" />
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="grow"
              placeholder="809-555-1234"
              onChange={handlePhoneChange}
              value={phone}
              inputMode="numeric"
              maxLength={12}
            />
          </label>
          <label htmlFor="email" className="input">
            <Mail className="w-5 h-5" />
            <input
              type="email"
              id="email"
              name="email"
              required
              className="grow"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </label>
          <label htmlFor="password" className="input">
            <Lock className="w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
              className="grow"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </label>
          <label htmlFor="confirmPassword" className="input">
            <Lock className="w-5 h-5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              required
              className="grow"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </label>
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Sign Up
          </button>
          <div className="flex justify-center">
            <Link to="/auth/login" className="link link-primary text-sm">I have an Account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm;