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
    <div className="relative flex w-full items-center justify-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="block max-h-[36rem] w-auto max-w-full object-contain" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/formr-house-tight.png" alt="" className="h-[55%] w-auto opacity-40" />
        </div>
      )}

      <button
        onClick={generate}
        disabled={busy}
        className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--color-text)] shadow backdrop-blur transition hover:bg-white disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 text-[var(--color-terra-deep)]" />}
        {busy ? "Rendering…" : src ? "Regenerate" : "Generate mockup"}
      </button>

      {note && (
        <div className="absolute right-3 top-12 z-20 max-w-xs rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white">
          {note}
        </div>
      )}
    </div>
  );
}
