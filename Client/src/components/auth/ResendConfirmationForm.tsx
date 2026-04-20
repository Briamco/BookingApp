import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, CircleAlert, Loader2, Mail } from "lucide-react";
import { authService } from "../../services/AuthService";
import { useToast } from "../../context/ToastContext";

function ResendConfirmationForm() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>(searchParams.get("email") ?? "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Enter the email address you used to create your account.");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await authService.resendConfirmation({ email });
      setIsSuccess(true);
      setMessage(response.message || "We sent a new confirmation email. Check your inbox.");
      addToast("success", "Confirmation email sent");
    } catch (error) {
      const errorMessage = error instanceof Error && error.message ? error.message : "Unable to resend confirmation email";
      setMessage(errorMessage);
      addToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card card-xl w-full max-w-md border border-base-300 bg-base-100 shadow-lg">
      <div className="card-body gap-4 p-8">
        <div className="space-y-1 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Resend confirmation</h2>
          <p className="text-sm text-base-content/70">We will send a new confirmation link to your email address.</p>
        </div>

        <div className={`flex items-start gap-3 rounded-2xl border p-4 ${isSuccess ? "border-success/30 bg-success/10" : "border-base-300 bg-base-200/50"}`}>
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess ? "bg-success/15 text-success" : "bg-base-300 text-base-content/70"}`}>
            {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
          </div>
          <p className={`text-sm leading-6 ${isSuccess ? "text-success-content" : "text-base-content/80"}`}>
            {message}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="resend-email" className="text-sm font-medium">
              Email
            </label>
            <label htmlFor="resend-email" className="input input-bordered flex w-full items-center gap-2">
              <Mail className="h-5 w-5 text-base-content/60" />
              <input
                type="email"
                id="resend-email"
                name="email"
                required
                className="grow"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="email"
                disabled={isSubmitting || isSuccess}
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || isSuccess}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send confirmation email"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-base-content/70">
          Already confirmed?{" "}
          <Link to="/auth/login" className="link link-primary font-medium">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResendConfirmationForm;