import type { Rarity } from "./types";

// Цвет имени предмета по редкости (как на lootlemon).
export const RARITY_TEXT_CLASS: Record<Rarity, string> = {
  legendary: "text-legendary",
  pearlescent: "text-pearlescent",
};
