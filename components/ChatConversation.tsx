"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";

type Msg = {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  createdProjectId?: string | null;
};

export function ChatConversation({
  projectId,
  projectName,
  greeting,
  variant = "compact",
  suggestions = [],
}: {
  projectId?: string;
  projectName?: string;
  greeting: string;
  variant?: "compact" | "full";
  suggestions?: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          projectId,
          projectName,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "", actions: data.actions, createdProjectId: data.createdProjectId },
      ]);
      if (data.actions?.length) router.refresh();
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  const isFull = variant === "full";

  return (
    <div className={`flex flex-col ${isFull ? "h-full min-h-0" : ""}`}>
      <div className={`flex-1 space-y-4 overflow-y-auto ${isFull ? "px-2 py-6 sm:px-6" : "px-4 py-4"}`}>
        {messages.length === 0 && (
          <div className="border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5">
            <div className="flex items-start gap-2 text-sm text-[var(--color-text)]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-terra-deep)]" />
              <span>{greeting}</span>
            </div>
            {suggestions.length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Try one of these</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendText(s)}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-[var(--color-ink)] text-[#EEEEED]"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-text)]"
              }`}
            >
              {m.content}
              {m.actions && m.actions.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-black/10 pt-2 text-xs text-[var(--color-muted)]">
                  {m.actions.map((a, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              )}
              {m.createdProjectId && (
                <a
                  href={`/projects/${m.createdProjectId}`}
                  className="mt-2 inline-block text-xs font-medium text-[var(--color-terra-deep)] underline"
                >
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

      <div className={`border-t border-[var(--color-border)] ${isFull ? "px-2 py-4 sm:px-6" : "p-3"}`}>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(input); }
            }}
            rows={isFull ? 2 : 1}
            placeholder={projectName ? `Ask about "${projectName}"…` : "Describe a project or ask for help…"}
            className={`max-h-48 flex-1 resize-none border border-[var(--color-border)] bg-[var(--color-panel)] text-sm outline-none focus:border-[var(--color-ink)] ${
              isFull ? "px-4 py-3.5 text-base" : "px-3 py-2.5"
            }`}
          />
          <button
            onClick={() => sendText(input)}
            disabled={busy || !input.trim()}
            className={`flex shrink-0 items-center justify-center bg-[var(--color-ink)] text-[#EEEEED] transition-colors hover:bg-[var(--color-terra-deep)] disabled:opacity-40 disabled:hover:bg-[var(--color-ink)] ${
              isFull ? "h-12 w-12" : "h-10 w-10"
            }`}
          >
            <Send className={isFull ? "h-5 w-5" : "h-4 w-4"} />
          </button>
        </div>
      </div>
    </div>
  );
}
