// app/(user)/register/page.tsx
"use client";

import { registerCandidate } from "@/app/actions/authAction";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    const res = await registerCandidate(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    try {
      // Auto sign-in after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      // Handle NextAuth v5 CredentialsSignin exception
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-zinc-50 to-zinc-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-xl p-8 sm:p-10 transition-all">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4 ring-1 ring-blue-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5">
              Create an account to get started
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-medium animate-in fade-in slide-in-from-top-1">
              <svg
                className="w-4 h-4 shrink-0 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                disabled={loading}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={loading}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                disabled={loading}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Sign up & Continue"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}