"use client";

import { useState } from "react";
import { X, ImageIcon, FileText } from "lucide-react";
import type { FileRef } from "@/lib/types";

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i;

export function Gallery({ files }: { files: FileRef[] }) {
  const [active, setActive] = useState<FileRef | null>(null);

  if (files.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No images or plans yet. Drop product photos, inspiration, renderings, or PDF plans here as you collect them.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {files.map((f) => {
          const isImg = f.url && (IMAGE_RE.test(f.url) || f.url.includes("images.unsplash.com"));
          return (
            <button
              key={f.id}
              onClick={() => isImg && setActive(f)}
              className="glass glass-hover group relative aspect-square overflow-hidden rounded-xl text-left"
            >
              {isImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url as string} alt={f.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-[var(--color-muted)]">
                  <FileText className="h-7 w-7" />
                  <span className="line-clamp-2 text-xs">{f.name}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs text-white">
                <ImageIcon className="h-3 w-3 shrink-0 opacity-70" />
                <span className="line-clamp-1">{f.type || "File"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.url as string} alt={active.name} className="max-h-[85vh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
