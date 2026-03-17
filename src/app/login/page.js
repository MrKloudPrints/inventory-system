"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm border border-neutral-200 p-8">
        <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 mb-8 text-center">
          INVENTORY SYSTEM
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white text-xs uppercase tracking-[0.15em] py-2.5 hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
