import { matchSorter } from "match-sorter";
import type { ElementKey, LootItem, Rarity } from "./types";
import type { SortDir, SortField } from "@/components/loot-table";

export interface LootFilters {
  rarity: Rarity[];
  elements: ElementKey[];
  types: string[];
  manufacturers: string[];
  contents: string[];
  regions: string[];
  worldDropOnly: boolean;
  phospheneOnly: boolean;
}

export const EMPTY_FILTERS: LootFilters = {
  rarity: [],
  elements: [],
  types: [],
  manufacturers: [],
  contents: [],
  regions: [],
  worldDropOnly: false,
  phospheneOnly: false,
};

export function activeFilterCount(f: LootFilters): number {
  return (
    f.rarity.length +
    f.elements.length +
    f.types.length +
    f.manufacturers.length +
    f.contents.length +
    f.regions.length +
    (f.worldDropOnly ? 1 : 0) +
    (f.phospheneOnly ? 1 : 0)
  );
}

function typeLabel(item: LootItem): string {
  return item.typeEn || item.type;
}

function passesFilters(item: LootItem, f: LootFilters): boolean {
  if (f.rarity.length && !f.rarity.includes(item.rarity)) return false;
  if (f.elements.length && !f.elements.some((e) => item.elements.includes(e)))
    return false;
  if (f.types.length && !f.types.includes(typeLabel(item))) return false;
  if (
    f.manufacturers.length &&
    !(item.manufacturer && f.manufacturers.includes(item.manufacturer))
  )
    return false;
  if (f.contents.length && !f.contents.includes(item.content)) return false;
  if (f.regions.length && !(item.region && f.regions.includes(item.region)))
    return false;
  if (f.worldDropOnly && !item.worldDrop) return false;
  if (f.phospheneOnly && item.phosphene !== true) return false;
  return true;
}

const RARITY_RANK: Record<Rarity, number> = {
  legendary: 0,
  pearlescent: 1,
};

function compare(a: LootItem, b: LootItem, field: SortField): number {
  switch (field) {
    case "rarity":
      return RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity];
    case "name":
      return a.name.localeCompare(b.name, "ru");
    case "type":
      return typeLabel(a).localeCompare(typeLabel(b), "ru");
    case "manufacturer":
      return (a.manufacturer ?? "").localeCompare(b.manufacturer ?? "", "ru");
    case "content":
      return a.content.localeCompare(b.content, "ru");
  }
}

export function selectItems(
  source: LootItem[],
  opts: {
    search: string;
    filters: LootFilters;
    sortField: SortField;
    sortDir: SortDir;
  },
): LootItem[] {
  const faceted = source.filter((i) => passesFilters(i, opts.filters));

  const query = opts.search.trim();
  const searched = query
    ? matchSorter(faceted, query, {
        keys: ["name", "nameEn", "feature"],
      })
    : faceted;

  const sorted = [...searched].sort((a, b) => {
    const c = compare(a, b, opts.sortField);
    return opts.sortDir === "asc" ? c : -c;
  });
  return sorted;
}
