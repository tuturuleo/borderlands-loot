// Доступ к предзапечённым данным лута (генерируются `npm run update`).
import rawItems from "@/data/items.json";
import type { Category, LootItem } from "./types";

export const items = rawItems as LootItem[];

export function getItemsByCategory(category: Category): LootItem[] {
  return items.filter((i) => i.category === category);
}

export function getItemById(id: string): LootItem | undefined {
  return items.find((i) => i.id === id);
}

// Уникальные непустые значения поля — для построения фасетов.
export function uniqueValues<K extends keyof LootItem>(
  list: LootItem[],
  key: K,
): string[] {
  const set = new Set<string>();
  for (const item of list) {
    const v = item[key];
    if (typeof v === "string" && v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ru"));
}
