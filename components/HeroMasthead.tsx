import Link from "next/link";
import Image from "next/image";
import type { ProjectWithTotals } from "@/lib/data";
import { currency } from "@/lib/format";

/**
 * Editorial hero (Forma Haus-inspired): near-black canvas, massive Fraunces
 * display type ("Formr / Li[HOUSE]ving") with the marble Formr house tucked
 * inside the wordmark. Stats + description sit above; footer meta strip below.
 */
export function HeroMasthead({
  featured,
  totalProjects,
  activeProjects,
  totalSpent,
  totalBudget,
}: {
  featured?: ProjectWithTotals;
  totalProjects: number;
  activeProjects: number;
  totalSpent: number;
  totalBudget: number;
}) {
  const featuredHref = featured ? `/projects/${featured.id}` : undefined;

  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] text-[#EEEEED]">
      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
        {/* Top strip: intro + stats */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 sm:mb-24 sm:flex-row sm:items-end">
          <div className="max-w-[46rem]">
            <p className="eyebrow-on-ink">A record of every project</p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted-cool)]">
              Plans, materials, budgets, and the details that make a house feel custom — kept carefully so nothing gets lost between the daydream and the doing.
            </p>
          </div>
          <div className="flex items-baseline gap-10 sm:gap-14">
            <Stat value={String(totalProjects)} label="Projects on the ledger" />
            <Stat value={String(activeProjects)} label="Active this season" />
          </div>
        </div>

        {/* Display type with marble house tucked in */}
        <h1 className="font-display-huge tracking-[-0.055em]">
          <span className="block text-[19vw] leading-[0.9] sm:text-[13rem] lg:text-[16rem]">Formr</span>
          <span className="mt-2 flex items-baseline text-[19vw] leading-[0.9] sm:text-[13rem] lg:text-[16rem]">
            <span>Li</span>
            <HouseInset featuredHref={featuredHref} featuredName={featured?.name} />
            <span>ing</span>
          </span>
        </h1>

        {/* Bottom meta strip */}
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-[#EEEEED]/12 pt-6 sm:mt-16">
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted-cool)]">
            The DIY Home Edit · Vol. 01 · Est. 2026
          </div>
          {totalBudget > 0 && (
            <div className="text-xs text-[var(--color-muted-cool)]">
              <span className="text-[#EEEEED]">{currency(totalSpent)}</span> spent
              <span className="mx-1.5">of</span>
              <span className="text-[#EEEEED]">{currency(totalBudget)}</span> planned
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** The marble Formr house, sized to fit between capital letters in the display line. */
function HouseInset({ featuredHref, featuredName }: { featuredHref?: string; featuredName?: string }) {
  const img = (
    <Image
      src="/brand/formr-house-tight.png"
      alt="Formr"
      width={1174}
      height={1363}
      priority
      className="mx-[0.02em] w-auto shrink-0 select-none"
      style={{
        height: "0.5em",
        transform: "rotate(180deg)",
        filter: "drop-shadow(0 6px 20px rgba(255, 245, 220, 0.05))",
      }}
    />
  );
  if (!featuredHref) return img;
  return (
    <Link href={featuredHref} aria-label={featuredName ? `Open ${featuredName}` : "Open featured project"} className="group inline-flex shrink-0 items-center">
      {img}
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl leading-none tracking-tight sm:text-5xl">{value}</div>
      <div className="mt-2 max-w-[12ch] text-[0.65rem] uppercase leading-tight tracking-[0.2em] text-[var(--color-muted-cool)]">
        {label}
      </div>
    </div>
  );
}
