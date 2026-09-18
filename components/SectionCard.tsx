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
    <section className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <h2 className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-terra-deep)]">
          {icon}
          {title}
        </h2>
        {accent && <div className="text-xs text-[var(--color-muted)]">{accent}</div>}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[var(--color-muted)]">{children}</p>;
}
