"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, signup as signupApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signupApi(email, password);
      }
      const result = await loginApi(email, password);
      login(result.token, result.user);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#17171B] text-[#E9E9EC] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1E1E23] border border-white/10 rounded-lg p-8"
      >
        <h1 className="text-xl font-medium text-center mb-6">
          {mode === "login" ? "Log in" : "Sign up"}
        </h1>

        <label className="block text-xs text-[#9A9AA2] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
        />

        <label className="block text-xs text-[#9A9AA2] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full mb-4 px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-[#3E8E63] hover:bg-[#4CA876] font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-3 text-xs text-[#9A9AA2] hover:text-[#E9E9EC]"
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
