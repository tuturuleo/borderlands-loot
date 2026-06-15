/**
 * Скрипт обновления данных лута.
 *
 *   npm run update
 *
 * Тянет публичную гугл-таблицу (CSV), нормализует в src/data/items.json
 * и скачивает картинки предметов в public/items (см. fetchImages).
 *
 * Данные коммитятся в гит — сайт полностью статический.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { normalizeRow, type RawRow } from "../src/lib/normalize";
import type { LootItem } from "../src/lib/types";
import { fetchImages } from "./fetch-images";

const SHEET_ID =
  process.env.SHEET_ID || "1ZxbOGnJveB4a5Lju3Xy33_ff1XOSEnujtmgBl4h6zuE";
const GID = process.env.SHEET_GID || "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");

async function fetchCsv(): Promise<string> {
  console.log(`→ Загружаю таблицу:\n  ${CSV_URL}`);
  const res = await fetch(CSV_URL, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить таблицу: HTTP ${res.status}. ` +
        `Проверь, что доступ открыт «Anyone with the link → Viewer».`,
    );
  }
  const text = await res.text();
  if (text.trimStart().startsWith("<!DOCTYPE")) {
    throw new Error(
      "Таблица вернула HTML (страница логина) вместо CSV — доступ закрыт.",
    );
  }
  return text;
}

function parse(csv: string): LootItem[] {
  const { data, errors } = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  if (errors.length) {
    console.warn(`⚠ Папарсер сообщил о ${errors.length} проблемах (не критично)`);
  }
  const items = data
    .map(normalizeRow)
    .filter((x): x is LootItem => x !== null);
  return items;
}

async function main() {
  const csv = await fetchCsv();
  const items = parse(csv);
  console.log(`✓ Распознано предметов: ${items.length}`);

  // Сводка по категориям для контроля.
  const byCat = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log("  по категориям:", byCat);

  // Картинки: скачиваем и проставляем item.image.
  await fetchImages(items, ROOT);

  await mkdir(DATA_DIR, { recursive: true });
  const outFile = path.join(DATA_DIR, "items.json");
  await writeFile(outFile, JSON.stringify(items, null, 2) + "\n", "utf8");
  console.log(`✓ Записано: ${path.relative(ROOT, outFile)}`);
}

main().catch((err) => {
  console.error("✗ Ошибка обновления:", err.message ?? err);
  process.exit(1);
});
