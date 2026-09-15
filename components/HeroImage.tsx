"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2 } from "lucide-react";

export function HeroImage({ cover, projectId }: { cover: string | null; projectId: string }) {
  const [src, setSrc] = useState<string | null>(cover);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const router = useRouter();

  async function generate() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.url) { setSrc(data.url); router.refresh(); }
      else if (data.dataUrl) { setSrc(data.dataUrl); setNote("Preview only — connect the database to save mockups."); }
      else setNote(data.error || "Could not generate a mockup.");
    } catch {
      setNote("Network error generating mockup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-bg-soft)]" />
      )}

      <button
        onClick={generate}
        disabled={busy}
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-[var(--color-text)] shadow backdrop-blur transition hover:bg-white disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-[var(--color-accent-strong)]" />}
        {busy ? "Rendering…" : src ? "Regenerate mockup" : "Generate mockup"}
      </button>

      {note && (
        <div className="absolute right-4 top-14 z-20 max-w-xs rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white">
          {note}
        </div>
      )}
    </>
  );
}
