"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Ticket,
  Mail,
  Lock,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { login as loginApi, signup as signupApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  // Focus email input on tab switch
  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const toastId = toast.loading(
      mode === "login" ? "Logging in..." : "Creating account..."
    );

    try {
      if (mode === "signup") {
        await signupApi(email, password);
        toast.success("Account created successfully!", { id: toastId });
      }

      const result = await loginApi(email, password);
      login(result.token, result.user);

      if (mode === "login") {
        toast.success("Welcome back! Logged in successfully.", { id: toastId });
      }

      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: "login" | "signup") {
    if (newMode === mode) return;
    setMode(newMode);
    setError(null);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }

  return (
    <div className="auth-page">
      {/* Static subtle background glow */}
      <div className="auth-bg-glow" />

      <div className="auth-container">
        {/* ── Left Panel: Branding ── */}
        <div className="auth-brand-panel">
          <div className="auth-brand-grid" />
          <div className="auth-brand-content">
            <div className="auth-brand-icon">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <h2 className="auth-brand-title">SeatBooking</h2>
            <p className="auth-brand-tagline">
              Reserve your perfect seat for any live event. Instant confirmation & seamless booking.
            </p>

            <div className="auth-brand-features">
              {[
                "Real-time seat availability map",
                "Instant confirmation & digital tickets",
                "Secure & transparent checkout",
              ].map((feature) => (
                <div key={feature} className="auth-brand-feature">
                  <CheckCircle2 className="w-4 h-4 text-[#3e8e63] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            {/* Mode Switcher Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
                onClick={() => switchMode("login")}
                id="auth-tab-login"
              >
                Log in
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === "signup" ? "auth-tab--active" : ""}`}
                onClick={() => switchMode("signup")}
                id="auth-tab-signup"
              >
                Sign up
              </button>
            </div>

            <h1 className="auth-heading">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="auth-subheading">
              {mode === "login"
                ? "Enter your details to sign in to your account"
                : "Get started in seconds with a free account"}
            </p>

            {/* Error Notification Bar */}
            {error && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" id="auth-form">
              {/* Email Input */}
              <div className="auth-field">
                <label htmlFor="auth-email" className="auth-label">
                  Email address
                </label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    ref={emailRef}
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Password Input with Toggle Icon */}
              <div className="auth-field">
                <label htmlFor="auth-password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="auth-input auth-input--password"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                    id="auth-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="auth-hint">Must contain at least 8 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
                id="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Link */}
            <p className="auth-footer">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="auth-footer-link"
                    onClick={() => switchMode("signup")}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="auth-footer-link"
                    onClick={() => switchMode("login")}
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Scoped Styling (No Animations) ── */}
      <style>{`
        .auth-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background-color: #0c0c10;
          font-family: var(--font-geist-sans, system-ui, -apple-system, sans-serif);
        }

        .auth-bg-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(232, 163, 61, 0.08) 0%, transparent 60%),
                      radial-gradient(circle at 80% 80%, rgba(62, 142, 99, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .auth-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 900px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #14141a;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .auth-brand-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 2.5rem;
          background: linear-gradient(145deg, rgba(62, 142, 99, 0.12) 0%, rgba(232, 163, 61, 0.08) 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .auth-brand-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .auth-brand-content {
          position: relative;
          z-index: 1;
        }

        .auth-brand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3e8e63, #2a6b47);
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(62, 142, 99, 0.25);
        }

        .auth-brand-title {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f0f0f4;
          margin: 0 0 0.5rem;
        }

        .auth-brand-tagline {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #9a9aa8;
          margin: 0 0 2rem;
        }

        .auth-brand-features {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .auth-brand-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #b0b0ba;
        }

        .auth-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          background: #14141a;
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 340px;
        }

        .auth-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 3px;
          margin-bottom: 1.75rem;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .auth-tab {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #7a7a88;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }

        .auth-tab:hover:not(.auth-tab--active) {
          color: #c0c0cc;
        }

        .auth-tab--active {
          background: rgba(255, 255, 255, 0.09);
          color: #f0f0f4;
        }

        .auth-heading {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #f0f0f4;
          margin: 0 0 0.3rem;
        }

        .auth-subheading {
          font-size: 0.825rem;
          color: #7a7a88;
          margin: 0 0 1.5rem;
          line-height: 1.45;
        }

        .auth-error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          font-size: 0.82rem;
          margin-bottom: 1.25rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .auth-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: #a0a0ac;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          color: #5a5a68;
          pointer-events: none;
        }

        .auth-input-wrapper:focus-within .auth-input-icon {
          color: #e8a33d;
        }

        .auth-input {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 2.4rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: #e9e9ec;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
        }

        .auth-input::placeholder {
          color: #4a4a56;
        }

        .auth-input:focus {
          border-color: rgba(232, 163, 61, 0.5);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 3px rgba(232, 163, 61, 0.1);
        }

        .auth-input--password {
          padding-right: 2.5rem;
        }

        .auth-eye-btn {
          position: absolute;
          right: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          color: #6b6b7b;
        }

        .auth-eye-btn:hover {
          color: #e9e9ec;
          background: rgba(255, 255, 255, 0.06);
        }

        .auth-hint {
          font-size: 0.725rem;
          color: #5a5a68;
          margin: 0;
        }

        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          width: 100%;
          padding: 0.7rem 1.25rem;
          margin-top: 0.35rem;
          border: none;
          border-radius: 8px;
          background: #3e8e63;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        .auth-submit:hover:not(:disabled) {
          background: #4ca876;
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #7a7a88;
        }

        .auth-footer-link {
          background: none;
          border: none;
          color: #e8a33d;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
        }

        .auth-footer-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .auth-container {
            grid-template-columns: 1fr;
            max-width: 420px;
          }

          .auth-brand-panel {
            display: none;
          }

          .auth-form-panel {
            padding: 2.25rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
