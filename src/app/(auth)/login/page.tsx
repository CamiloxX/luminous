"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f8f5ff] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-4xl font-black text-[#0052d0] tracking-tighter italic"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Luminous
          </Link>
          <p className="text-[#545881] mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#272b51] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#f1efff] rounded-full py-3 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#272b51] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#f1efff] rounded-full py-3 px-5 text-[#272b51] placeholder:text-[#a6aad7] focus:outline-none focus:ring-2 focus:ring-[#0052d0]/30 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-[#b31b25] bg-[#fb5151]/10 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#0052d0] to-[#799dff] text-[#f1f2ff] font-bold py-4 rounded-full shadow-[0_12px_32px_rgba(0,82,208,0.2)] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#545881] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0052d0] font-bold hover:opacity-80 transition-opacity">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
