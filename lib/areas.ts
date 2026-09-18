import type { Project } from "./types";

/**
 * Areas are the physical zones of the house. Projects roll up into an area
 * based on their `room` field. Areas are used for the /areas/[slug] pages and
 * the "By Area" section on the dashboard.
 */

export type Area = {
  slug: string;
  name: string;
  /** Short caption shown under the area title. */
  blurb: string;
  /** Predicate that matches a project's room to this area. */
  match: (room: string | null | undefined) => boolean;
};

export const AREAS: Area[] = [
  {
    slug: "basement",
    name: "Basement",
    blurb: "The finish-out — framing, drywall, electrical, floor, and every surface underway.",
    match: (r) => !!r && r.toLowerCase().startsWith("basement"),
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    blurb: "The heart of the house — sink, cabinets, and the walnut pantry built-in.",
    match: (r) => !!r && (r.toLowerCase() === "kitchen" || r.toLowerCase() === "pantry"),
  },
  {
    slug: "bathrooms",
    name: "Bathrooms",
    blurb: "Master bath and half bath — tile, plumbing, and trim.",
    match: (r) => !!r && r !== "Basement Bathroom" && /bath/i.test(r),
  },
  {
    slug: "living",
    name: "Living Areas",
    blurb: "Living room paint, TV wall, and everyday spaces on the main floor.",
    match: (r) => !!r && (r.toLowerCase() === "living room" || r.toLowerCase() === "guest room"),
  },
  {
    slug: "outdoor",
    name: "Outdoor",
    blurb: "Deck, outdoor sofa, and anything exterior.",
    match: (r) => !!r && (/outdoor/i.test(r) || /deck/i.test(r)),
  },
  {
    slug: "garage",
    name: "Garage",
    blurb: "Floor stain, paint, and shop setup.",
    match: (r) => !!r && r.toLowerCase() === "garage",
  },
  {
    slug: "household",
    name: "Household",
    blurb: "Cleaning supplies and general home upkeep.",
    match: (r) => !!r && (r.toLowerCase() === "house" || r.toLowerCase() === "household"),
  },
];

export function areaForProject(project: { room: string | null }): Area | undefined {
  return AREAS.find((a) => a.match(project.room));
}

export function getAreaBySlug(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}

export function projectsInArea<T extends Project>(area: Area, projects: T[]): T[] {
  return projects.filter((p) => area.match(p.room));
}

/** Every area with its resolved project list — for dashboard rollup. */
export function groupProjectsByArea<T extends Project>(projects: T[]): { area: Area; projects: T[] }[] {
  return AREAS.map((area) => ({ area, projects: projectsInArea(area, projects) })).filter((g) => g.projects.length > 0);
}
