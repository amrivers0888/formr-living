import type { ReactNode } from "react";

export function SectionCard({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon?: ReactNode;
  accent?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass rounded-[var(--radius-xl2)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {icon}
          {title}
        </h2>
        {accent}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[var(--color-muted)]">{children}</p>;
}
