
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { authService } from "../../services/AuthService";

function ConfirmCard() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Confirming your email...");

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
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <h2 className="card-title">
          {isLoading ? "Confirming your email" : isSuccess ? "Email confirmed" : "Confirmation failed"}
        </h2>
        <p>{message}</p>
        <div className="card-actions">
          <Link to="/auth/login" className="btn btn-primary" aria-disabled={isLoading}>
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmCard;