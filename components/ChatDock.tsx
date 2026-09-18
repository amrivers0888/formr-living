"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { ChatConversation } from "./ChatConversation";

export function ChatDock({ live, projectId, projectName }: { live: boolean; projectId?: string; projectName?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("reno:open-chat", handler);
    return () => window.removeEventListener("reno:open-chat", handler);
  }, []);

  const greeting = projectName
    ? `Ask me to build out "${projectName}" — add materials, measurements, decisions, or build steps.`
    : `Describe a project and I'll create it. Try: "Create a floor-to-ceiling walnut pantry with two drawers and a hidden toaster."`;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[#EEEEED] shadow-[0_20px_40px_-20px_rgba(7,6,5,0.6)] transition-colors hover:bg-[var(--color-terra-deep)]"
        >
          <Sparkles className="h-5 w-5" />
          <span className="hidden sm:inline">Assistant</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[70vh] max-h-[640px] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel)] shadow-[0_40px_80px_-30px_rgba(7,6,5,0.5)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-ink)] px-4 py-3 text-[#EEEEED]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-tan)]" />
              <span className="text-sm font-medium">Formr Assistant</span>
              {!live && <span className="rounded-full border border-[var(--color-tan)]/40 px-2 py-0.5 text-[10px] font-medium text-[var(--color-tan)]">preview</span>}
            </div>
            <button onClick={() => setOpen(false)} className="rounded p-1 text-[var(--color-muted-cool)] hover:text-[#EEEEED]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatConversation projectId={projectId} projectName={projectName} greeting={greeting} variant="compact" />
          </div>
        </div>
      )}
    </>
  );
}
