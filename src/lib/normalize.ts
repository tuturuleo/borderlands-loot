// Нормализация сырых строк гугл-таблицы в типизированный LootItem.
// Используется только скриптом обновления (scripts/update.ts).

import type {
  Category,
  ElementKey,
  LootItem,
  Rarity,
  SourceTag,
} from "./types";

// Сырая строка как её отдаёт CSV (ключи = заголовки колонок таблицы).
export type RawRow = Record<string, string>;

// Значения, которые в таблице означают «пусто».
const EMPTY_VALUES = new Set(["", "-", "—", "∅", "?", "??", "n/a", "N/A"]);

function clean(value: string | undefined): string | null {
  if (value == null) return null;
  const v = value.trim();
  if (EMPTY_VALUES.has(v)) return null;
  return v;
}

function normalizeRarity(raw: string): Rarity {
  return raw.trim().toLowerCase().startsWith("перламут")
    ? "pearlescent"
    : "legendary";
}

// Маппинг русского «Тип» → категория-вкладка.
const TYPE_TO_CATEGORY: Record<string, Category> = {
  Автомат: "weapons",
  Дробовик: "weapons",
  Пистолет: "weapons",
  "Снайперская винтовка": "weapons",
  "Пистолет-пулемет": "weapons",
  "Тяжелое оружие": "weapons",
  Нож: "weapons",
  "Энергетический щит": "shields",
  Бронещит: "shields",
  Граната: "ordnance",
  Ремкомплект: "repkits",
  Улучшение: "enhancements",
  Амон: "class-mods",
  Векс: "class-mods",
  Рафа: "class-mods",
  Харлоу: "class-mods",
  "Н@л": "class-mods",
};

function normalizeCategory(type: string): Category {
  return TYPE_TO_CATEGORY[type.trim()] ?? "weapons";
}

// Базовые кодпоинты эмодзи стихий (без variation selector).
const ELEMENT_EMOJI: Array<[string, ElementKey]> = [
  ["❌", "kinetic"],
  ["🔥", "fire"],
  ["⚡", "shock"],
  ["☣", "corrosive"],
  ["❄", "cryo"],
  ["☢", "radiation"],
];

function normalizeElements(raw: string): ElementKey[] {
  // У модов/улучшений в этой колонке числа («1, 2») — стихий нет.
  const out: ElementKey[] = [];
  for (const [emoji, key] of ELEMENT_EMOJI) {
    if (raw.includes(emoji)) out.push(key);
  }
  return out;
}

function normalizeWorldDrop(raw: string): {
  worldDrop: boolean;
  worldDropDlcOnly: boolean;
} {
  const v = raw.trim().toLowerCase();
  const worldDrop = v.startsWith("+");
  return { worldDrop, worldDropDlcOnly: worldDrop && v.includes("длс") };
}

function normalizePhosphene(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (v.startsWith("+")) return true;
  if (v === "нет") return false;
  return null; // «?», «??», пусто
}

function buildSources(opts: {
  source: string | null;
  region: string | null;
  location: string | null;
  typeEn: string;
  worldDrop: boolean;
  worldDropDlcOnly: boolean;
}): SourceTag[] {
  const tags: SourceTag[] = [];

  // Конкретный источник/босс + где он находится.
  if (opts.source) {
    tags.push({
      label: opts.source,
      sub: opts.location ?? opts.region ?? undefined,
    });
  }

  // Пул world drop — как «Shotgun Pool / World Wide» на lootlemon.
  if (opts.worldDrop) {
    const pool = opts.typeEn ? `${opts.typeEn} Pool` : "World Drop";
    tags.push({
      label: pool,
      sub: opts.worldDropDlcOnly ? "DLC only" : "World Wide",
    });
  }

  return tags;
}

// Слаг для имени файла картинки (берётся из ссылки lootlemon, иначе из id).
export function imageSlug(item: Pick<LootItem, "id" | "lootlemonUrl">): string {
  if (item.lootlemonUrl) {
    // Последний сегмент пути: /weapon/abyss-bl4 → abyss-bl4, /shield/foo → foo
    const segments = item.lootlemonUrl
      .split(/[?#]/)[0]
      .split("/")
      .filter(Boolean);
    const last = segments[segments.length - 1];
    if (last) return last;
  }
  return `id-${item.id}`;
}

export function normalizeRow(row: RawRow): LootItem | null {
  const id = clean(row["ID"]);
  const name = clean(row["Имя"]);
  if (!id || !name) return null; // пропускаем мусорные/пустые строки

  const type = (row["Тип"] ?? "").trim();
  const typeEn = (row["Weapon Type"] ?? "").trim();
  const source = clean(row["Источник"]);
  const region = clean(row["Район"]);
  const location = clean(row["Локация"]);
  const { worldDrop, worldDropDlcOnly } = normalizeWorldDrop(
    row["Ворлд дроп"] ?? "",
  );

  return {
    id,
    rarity: normalizeRarity(row["Редкость"] ?? ""),
    name,
    nameEn: (row["Имя (eng)"] ?? "").trim(),
    category: normalizeCategory(type),
    type,
    typeEn,
    manufacturer: clean(row["Производитель"]),
    elements: normalizeElements(row["Стихии"] ?? ""),
    content: (row["Content"] ?? "").trim() || "Base Game",
    feature: (row["Особенность"] ?? "").trim(),
    sources: buildSources({
      source,
      region,
      location,
      typeEn,
      worldDrop,
      worldDropDlcOnly,
    }),
    source,
    bossType: clean(row["Тип босса"]),
    region,
    location,
    worldDrop,
    worldDropDlcOnly,
    phosphene: normalizePhosphene(row["Фосфен"] ?? ""),
    lootlemonUrl: clean(row["Ссылка на лутлемон"]),
    image: null, // заполняется этапом скачивания картинок
  };
}
