
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { authService } from "../../services/AuthService";

function ConfirmCard() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Confirming your email...");

  const statusTitle = isLoading
    ? "Confirming your email"
    : isSuccess
      ? "Email confirmed"
      : "Confirmation failed";

  const statusTone = isLoading ? "status-info" : isSuccess ? "status-success" : "status-error";

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setIsSuccess(false);
      setMessage("Invalid confirmation link. Missing token.");
      setIsLoading(false);
      return;
    }

    const confirmEmail = async () => {
      try {
        await authService.confirm(token);
        setIsSuccess(true);
        setMessage("Your email has been confirmed. You can now log in.");
      } catch (error) {
        setIsSuccess(false);
        if (error instanceof Error && error.message) {
          setMessage(error.message);
        } else {
          setMessage("Email confirmation failed. Please request a new confirmation link.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void confirmEmail();
  }, [searchParams]);

  return (
    <div className="card card-xl w-full max-w-md border border-base-300 bg-base-100 shadow-lg">
      <div className="card-body items-center gap-4 p-8 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border ${isLoading
            ? "border-info/30 bg-info/10"
            : isSuccess
              ? "border-success/30 bg-success/10"
              : "border-error/30 bg-error/10"
            }`}
          aria-hidden="true"
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-info" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-8 w-8 text-success" />
          ) : (
            <CircleAlert className="h-8 w-8 text-error" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{statusTitle}</h2>
          <p className="text-sm text-base-content/70">{message}</p>
        </div>

        <div className={`badge badge-outline ${statusTone}`}>
          {isLoading ? "Waiting for server response" : isSuccess ? "Ready to sign in" : "Action required"}
        </div>

        <div className="card-actions mt-2 w-full">
          <Link
            to="/auth/login"
            className={`btn btn-primary w-full ${isLoading ? "pointer-events-none btn-disabled" : ""}`}
            aria-disabled={isLoading}
          >
            Go to Login
          </Link>

          {!isSuccess && !isLoading ? (
            <div className="grid w-full gap-2">
              <Link to="/auth/resend-confirmation" className="btn btn-secondary w-full">
                Resend confirmation email
              </Link>
              <Link to="/auth/register" className="btn btn-ghost w-full">
                Create a new account
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ConfirmCard;