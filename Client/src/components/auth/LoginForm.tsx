import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authService } from "../../services/AuthService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const { addToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)

    try {
      const response = await authService.login({ email, password })

      login(response.token, response.user)

      addToast('success', 'Logged in successfully')
      navigate('/')
    } catch (error: any) {
      addToast('error', error.response?.data || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card card-xl w-full max-w-md border border-base-300 bg-base-100/95 shadow-xl">
      <div className="card-body p-6 sm:p-8">
        <div className="mb-2 space-y-1 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-base-content/70">Sign in to continue managing your bookings.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <label htmlFor="login-email" className="input input-bordered flex w-full items-center gap-2">
              <Mail className="h-5 w-5 text-base-content/60" />
              <input
                type="email"
                id="login-email"
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

          <div className="space-y-1">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <label htmlFor="login-password" className="input input-bordered flex w-full items-center gap-2">
              <Lock className="h-5 w-5 text-base-content/60" />
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                name="password"
                required
                className="grow"
                placeholder="Your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                autoComplete="current-password"
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

          <button type="submit" className="btn btn-primary mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center text-sm text-base-content/70">
            Don't have an account?{" "}
            <Link to="/auth/register" className="link link-primary font-medium" aria-disabled={isSubmitting}>
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm;