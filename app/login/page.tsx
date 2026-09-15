"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer, Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) router.push("/");
    else setError(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-[var(--radius-xl2)] p-7">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <Hammer className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold">Reno<span className="text-[var(--color-accent)]">Hub</span></span>
        </div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">Enter your password</label>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3">
          <Lock className="h-4 w-4 text-[var(--color-muted)]" />
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">Incorrect password.</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-[var(--color-accent)] py-2.5 font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
