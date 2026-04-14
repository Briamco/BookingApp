import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authService } from "../../services/AuthService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

function LoginForm() {
  const { addToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await authService.login({ email, password })

      login(response.token, response.user)

      addToast('success', 'Logged in successfully')
      navigate('/')
    } catch (error: any) {
      addToast('error', error.response?.data || 'Login failed')
    }
  }

  return (
    <div className="card card-xl bg-base-100 w-96 shadow-md">
      <div className="card-body">
        <h2 className="card-title">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Sign In
          </button>
          <div className="flex justify-center">
            <Link to="/auth/register" className="link link-primary text-sm">Dont have account?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm;