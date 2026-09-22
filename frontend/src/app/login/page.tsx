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
      mode === "login" ? "Logging in..." : "Creating account...",
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
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0c0c10] font-sans">
      {/* Static subtle background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(232,163,61,0.08)_0%,transparent_60%),radial-gradient(circle_at_80%_80%,rgba(62,142,99,0.08)_0%,transparent_50%)]" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 w-full max-w-105 md:max-w-225 rounded-2xl overflow-hidden border border-white/8 bg-[#14141a] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* ── Left Panel: Branding ── */}
        <div className="hidden md:flex relative flex-col justify-center px-10 py-12 bg-linear-to-br from-[rgba(62,142,99,0.12)] to-[rgba(232,163,61,0.08)] border-r border-white/6">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[32px_32px]" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-13 h-13 rounded-xl bg-linear-to-br from-[#3e8e63] to-[#2a6b47] mb-6 shadow-[0_4px_16px_rgba(62,142,99,0.25)]">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-[1.75rem] font-bold tracking-[-0.02em] text-[#f0f0f4] mb-2">
              SeatBooking
            </h2>
            <p className="text-[0.9rem] leading-relaxed text-[#9a9aa8] mb-8">
              Reserve your perfect seat for any live event. Instant confirmation
              & seamless booking.
            </p>

            <div className="flex flex-col gap-[0.85rem]">
              {[
                "Real-time seat availability map",
                "Instant confirmation & digital tickets",
                "Secure & transparent checkout",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-[0.85rem] text-[#b0b0ba]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#3e8e63] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div className="flex items-center justify-center px-10 py-12 bg-[#14141a]">
          <div className="w-full max-w-85">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-white/4 rounded-lg p-0.75 mb-7 border border-white/4">
              <button
                type="button"
                className={`flex-1 py-2 border-0 rounded-md text-[0.85rem] font-medium cursor-pointer ${
                  mode === "login"
                    ? "bg-white/9 text-[#f0f0f4]"
                    : "bg-transparent text-[#7a7a88] hover:text-[#c0c0cc]"
                }`}
                onClick={() => switchMode("login")}
                id="auth-tab-login"
              >
                Log in
              </button>
              <button
                type="button"
                className={`flex-1 py-2 border-0 rounded-md text-[0.85rem] font-medium cursor-pointer ${
                  mode === "signup"
                    ? "bg-white/9 text-[#f0f0f4]"
                    : "bg-transparent text-[#7a7a88] hover:text-[#c0c0cc]"
                }`}
                onClick={() => switchMode("signup")}
                id="auth-tab-signup"
              >
                Sign up
              </button>
            </div>

            <h1 className="text-[1.4rem] font-bold tracking-[-0.01em] text-[#f0f0f4] mb-[0.3rem]">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-[0.825rem] text-[#7a7a88] mb-6 leading-[1.45]">
              {mode === "login"
                ? "Enter your details to sign in to your account"
                : "Get started in seconds with a free account"}
            </p>

            {/* Error Notification Bar */}
            {error && (
              <div
                className="flex items-center gap-2 py-[0.65rem] px-[0.85rem] rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171] text-[0.82rem] mb-5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[1.15rem]"
              id="auth-form"
            >
              {/* Email Input */}
              <div className="flex flex-col gap-[0.35rem]">
                <label
                  htmlFor="auth-email"
                  className="text-[0.78rem] font-medium text-[#a0a0ac]"
                >
                  Email address
                </label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-3 w-4 h-4 text-[#5a5a68] pointer-events-none group-focus-within:text-[#e8a33d]" />
                  <input
                    ref={emailRef}
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full py-[0.65rem] pr-[0.85rem] pl-[2.4rem] border border-white/8 rounded-lg bg-white/3 text-[#e9e9ec] text-[0.875rem] outline-none placeholder:text-[#4a4a56] focus:border-[rgba(232,163,61,0.5)] focus:bg-white/5 focus:shadow-[0_0_0_3px_rgba(232,163,61,0.1)]"
                  />
                </div>
              </div>

              {/* Password Input with Toggle Icon */}
              <div className="flex flex-col gap-[0.35rem]">
                <label
                  htmlFor="auth-password"
                  className="text-[0.78rem] font-medium text-[#a0a0ac]"
                >
                  Password
                </label>
                <div className="relative flex items-center group">
                  <Lock className="absolute left-3 w-4 h-4 text-[#5a5a68] pointer-events-none group-focus-within:text-[#e8a33d]" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder={
                      mode === "signup" ? "At least 8 characters" : "••••••••"
                    }
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    className="w-full py-[0.65rem] pr-10 pl-[2.4rem] border border-white/8 rounded-lg bg-white/3 text-[#e9e9ec] text-[0.875rem] outline-none placeholder:text-[#4a4a56] focus:border-[rgba(232,163,61,0.5)] focus:bg-white/5 focus:shadow-[0_0_0_3px_rgba(232,163,61,0.1)]"
                  />
                  <button
                    type="button"
                    className="absolute right-1.5 flex items-center justify-center w-8 h-8 border-0 rounded-md bg-transparent cursor-pointer text-[#6b6b7b] hover:text-[#e9e9ec] hover:bg-white/6"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                  <p className="text-[0.725rem] text-[#5a5a68] m-0">
                    Must contain at least 8 characters
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-[0.4rem] w-full py-[0.7rem] px-5 mt-[0.35rem] border-0 rounded-lg bg-[#3e8e63] text-white text-[0.875rem] font-semibold cursor-pointer hover:enabled:bg-[#4ca876] disabled:opacity-60 disabled:cursor-not-allowed"
                id="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Link */}
            <p className="text-center mt-6 text-[0.8rem] text-[#7a7a88]">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="bg-transparent border-0 text-[#e8a33d] font-semibold cursor-pointer p-0 hover:underline"
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
                    className="bg-transparent border-0 text-[#e8a33d] font-semibold cursor-pointer p-0 hover:underline"
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
    </div>
  );
}
