// Доменные типы лута Borderlands 4.
// Данные генерируются скриптом scripts/update.ts в src/data/items.json.

export type Rarity = "legendary" | "pearlescent";

export type ElementKey =
  | "kinetic"
  | "fire"
  | "shock"
  | "corrosive"
  | "cryo"
  | "radiation";

// Категории как в навигации lootlemon (вкладки сверху).
export type Category =
  | "weapons"
  | "shields"
  | "ordnance"
  | "repkits"
  | "class-mods"
  | "enhancements";

// Один «тег источника» в колонке Sources: жирная подпись + подзаголовок.
export interface SourceTag {
  label: string;
  sub?: string;
}

export interface LootItem {
  id: string;
  rarity: Rarity;
  /** Русское имя */
  name: string;
  /** Английское имя (для поиска и сопоставления) */
  nameEn: string;
  /** Категория-вкладка */
  category: Category;
  /** Тип (рус.), напр. «Автомат», «Энергетический щит» */
  type: string;
  /** Тип (англ.), напр. «Assault Rifle» */
  typeEn: string;
  /** Производитель, напр. «Jakobs». null для не-оружия */
  manufacturer: string | null;
  /** Стихии оружия (для не-оружия пусто) */
  elements: ElementKey[];
  /** Контент: «Base Game» либо название DLC */
  content: string;
  /** «Особенность» — red text / описание эффекта */
  feature: string;
  /** Готовые теги для колонки Sources */
  sources: SourceTag[];
  /** Сырой источник/босс (для фасета) */
  source: string | null;
  /** Тип босса (для фасета) */
  bossType: string | null;
  /** Регион/район (для фасета) */
  region: string | null;
  /** Локация */
  location: string | null;
  /** Падает ли как world drop */
  worldDrop: boolean;
  /** World drop только в DLC */
  worldDropDlcOnly: boolean;
  /** Фосфен: true/false/null (неизвестно) */
  phosphene: boolean | null;
  /** Ссылка на страницу lootlemon (если есть) */
  lootlemonUrl: string | null;
  /** Простой чистый рендер (для списка). Путь в /public или null */
  image: string | null;
  /** Детальная карточка со статами (для детальной страницы). Путь в /public или null */
  imageCard: string | null;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  legendary: "Легендарный",
  pearlescent: "Перламутровый",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  weapons: "Оружие",
  shields: "Щиты",
  ordnance: "Гранаты",
  repkits: "Ремкомплекты",
  "class-mods": "Модификаторы класса",
  enhancements: "Улучшения",
};

// Порядок вкладок как на референсе.
export const CATEGORY_ORDER: Category[] = [
  "weapons",
  "shields",
  "ordnance",
  "repkits",
  "class-mods",
  "enhancements",
];

export const ELEMENT_LABEL: Record<ElementKey, string> = {
  kinetic: "Кинетический",
  fire: "Огонь",
  shock: "Шок",
  corrosive: "Кислота",
  cryo: "Крио",
  radiation: "Радиация",
};

export const ELEMENT_ORDER: ElementKey[] = [
  "kinetic",
  "fire",
  "shock",
  "corrosive",
  "cryo",
  "radiation",
];
