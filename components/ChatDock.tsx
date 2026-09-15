"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Send, Loader2, CheckCircle2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; actions?: string[]; createdProjectId?: string | null };

export function ChatDock({ live, projectId, projectName }: { live: boolean; projectId?: string; projectName?: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("reno:open-chat", handler);
    return () => window.removeEventListener("reno:open-chat", handler);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const greeting = projectName
    ? `Ask me to build out "${projectName}" — add materials, measurements, decisions, or build steps.`
    : `Describe a project and I'll create it. Try: "Create a floor-to-ceiling walnut pantry with two drawers and a hidden toaster."`;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })), projectId, projectName }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "", actions: data.actions, createdProjectId: data.createdProjectId }]);
      if (data.actions?.length) router.refresh();
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-3 font-semibold text-black shadow-lg shadow-black/40 transition-transform hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
          <span className="hidden sm:inline">Assistant</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[70vh] max-h-[640px] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              <span className="font-semibold">Reno Assistant</span>
              {!live && <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-medium text-yellow-400">preview</span>}
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-[var(--color-muted)] hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-3 text-sm text-[var(--color-muted)]">
                {greeting}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-[var(--color-accent)] text-black" : "bg-white/[0.04] text-[var(--color-text)]"}`}>
                  {m.content}
                  {m.actions && m.actions.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-white/10 pt-2 text-xs text-[var(--color-muted)]">
                      {m.actions.map((a, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.createdProjectId && (
                    <a href={`/projects/${m.createdProjectId}`} className="mt-2 inline-block text-xs font-medium text-[var(--color-accent)] underline">
                      Open the new project →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Describe a project or ask for help…"
                className="max-h-32 flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]/60"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-black disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
