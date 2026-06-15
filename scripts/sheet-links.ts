/**
 * Извлечение ссылок на lootlemon из колонки «Имя» (C).
 *
 * Гиперссылки в гугл-таблице висят на ячейках колонки C (Имя) и покрывают ВСЕ
 * предметы — в отличие от текстовой колонки D «Ссылка на лутлемон» (только ~43).
 * CSV-экспорт гиперссылки теряет, поэтому читаем XLSX (там они сохраняются).
 *
 * Возвращаем Map<id, url>, где id — значение колонки A (ID) той же строки.
 */
import { strFromU8, unzipSync } from "fflate";

const SHEET_ID =
  process.env.SHEET_ID || "1ZxbOGnJveB4a5Lju3Xy33_ff1XOSEnujtmgBl4h6zuE";
const XLSX_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

const SHEET_XML = "xl/worksheets/sheet1.xml";
const RELS_XML = "xl/worksheets/_rels/sheet1.xml.rels";

export async function fetchNameLinks(): Promise<Map<string, string>> {
  const res = await fetch(XLSX_URL, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Не удалось загрузить XLSX: HTTP ${res.status}`);
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  const files = unzipSync(buf, {
    filter: (f) => f.name === SHEET_XML || f.name === RELS_XML,
  });
  const xml = strFromU8(files[SHEET_XML]);
  const rels = strFromU8(files[RELS_XML]);

  // rId -> URL
  const relMap = new Map(
    [...rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]*)"/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );

  // строка -> URL (только гиперссылки колонки C = Имя)
  const rowToUrl = new Map<number, string>();
  for (const m of xml.matchAll(/<hyperlink r:id="(rId\d+)" ref="C(\d+)"/g)) {
    const url = relMap.get(m[1]);
    if (url) rowToUrl.set(Number(m[2]), url);
  }

  // строка -> ID (числовая ячейка колонки A)
  const rowToId = new Map<number, string>();
  for (const m of xml.matchAll(
    /<c r="A(\d+)"[^>]*?>(?:<f>[^<]*<\/f>)?<v>([^<]*)<\/v>/g,
  )) {
    // В XLSX числа хранятся как "1.0" — приводим к виду CSV-ID ("1").
    const id = Number.isFinite(Number(m[2])) ? String(Number(m[2])) : m[2];
    rowToId.set(Number(m[1]), id);
  }

  const idToUrl = new Map<string, string>();
  for (const [row, url] of rowToUrl) {
    const id = rowToId.get(row);
    if (id) idToUrl.set(id, url);
  }
  return idToUrl;
}
