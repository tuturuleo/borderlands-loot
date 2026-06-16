/**
 * Чтение того, что теряется в CSV-экспорте: гиперссылки и цветовая разметка.
 *
 *  • fetchNameLinks()   — ссылки на lootlemon из колонки C (Имя), Map<id, url>.
 *  • fetchFeatureRuns() — цветной rich-text «Особенности» (колонка K), Map<id, segments>.
 *
 * Гиперссылки висят на ячейках C (покрывают все предметы, в отличие от текстовой
 * колонки D). Цвет «Особенности» хранится в XLSX как rich-text (sharedStrings с
 * run-ами <r>, у каждого свой <color>). XLSX качаем и распаковываем один раз.
 */
import { strFromU8, unzipSync } from "fflate";
import type { FeatureSegment } from "../src/lib/types";

const SHEET_ID =
  process.env.SHEET_ID || "1v5NE3QnzZ8sgrD88aGJkbXTFRutEKyYn68Qh6xhFIcg";
const XLSX_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

const SHEET_XML = "xl/worksheets/sheet1.xml";
const RELS_XML = "xl/worksheets/_rels/sheet1.xml.rels";
const SHARED_XML = "xl/sharedStrings.xml";

interface Xlsx {
  sheet: string;
  rels: string;
  shared: string;
}

let cache: Xlsx | null = null;

async function loadXlsx(): Promise<Xlsx> {
  if (cache) return cache;
  const res = await fetch(XLSX_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`Не удалось загрузить XLSX: HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const files = unzipSync(buf, {
    filter: (f) =>
      f.name === SHEET_XML || f.name === RELS_XML || f.name === SHARED_XML,
  });
  cache = {
    sheet: strFromU8(files[SHEET_XML]),
    rels: files[RELS_XML] ? strFromU8(files[RELS_XML]) : "",
    shared: files[SHARED_XML] ? strFromU8(files[SHARED_XML]) : "",
  };
  return cache;
}

// строка -> ID (числовая ячейка колонки A; в XLSX число хранится как "1.0").
function rowToIdMap(sheet: string): Map<number, string> {
  const map = new Map<number, string>();
  for (const m of sheet.matchAll(
    /<c r="A(\d+)"[^>]*?>(?:<f>[^<]*<\/f>)?<v>([^<]*)<\/v>/g,
  )) {
    const id = Number.isFinite(Number(m[2])) ? String(Number(m[2])) : m[2];
    map.set(Number(m[1]), id);
  }
  return map;
}

export async function fetchNameLinks(): Promise<Map<string, string>> {
  const { sheet, rels } = await loadXlsx();

  const relMap = new Map(
    [...rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]*)"/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );

  const rowToUrl = new Map<number, string>();
  for (const m of sheet.matchAll(/<hyperlink r:id="(rId\d+)" ref="C(\d+)"/g)) {
    const url = relMap.get(m[1]);
    if (url) rowToUrl.set(Number(m[2]), url);
  }

  const rowToId = rowToIdMap(sheet);
  const idToUrl = new Map<string, string>();
  for (const [row, url] of rowToUrl) {
    const id = rowToId.get(row);
    if (id) idToUrl.set(id, url);
  }
  return idToUrl;
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// ARGB «FFFFC000» -> CSS «#FFC000»; нет цвета -> currentColor (наследует текст).
function toCss(argb: string | undefined): string {
  if (!argb) return "currentColor";
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  return `#${hex}`;
}

// Разбор одного <si> в сегменты. Плоская строка (без <r>) -> null (цвета нет).
function parseRuns(si: string): FeatureSegment[] | null {
  const runs = [...si.matchAll(/<r>([\s\S]*?)<\/r>/g)];
  if (runs.length === 0) return null;
  const segments: FeatureSegment[] = [];
  for (const r of runs) {
    const body = r[1];
    const color = body.match(/<color[^>]*rgb="([^"]+)"/);
    const text = body.match(/<t[^>]*>([\s\S]*?)<\/t>/);
    if (!text) continue;
    segments.push({
      text: unescapeXml(text[1]),
      color: toCss(color?.[1]),
    });
  }
  return segments.length ? segments : null;
}

export async function fetchFeatureRuns(): Promise<Map<string, FeatureSegment[]>> {
  const { sheet, shared } = await loadXlsx();
  if (!shared) return new Map();

  // Массив <si> по индексам sharedStrings.
  const sis = [...shared.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => m[1]);

  // строка -> индекс sharedString для ячейки колонки K (Особенность).
  const rowToIdx = new Map<number, number>();
  for (const m of sheet.matchAll(
    /<c r="K(\d+)"[^>]*\bt="s"[^>]*><v>(\d+)<\/v>/g,
  )) {
    rowToIdx.set(Number(m[1]), Number(m[2]));
  }

  const rowToId = rowToIdMap(sheet);
  const idToSegments = new Map<string, FeatureSegment[]>();
  for (const [row, idx] of rowToIdx) {
    const id = rowToId.get(row);
    if (!id || sis[idx] === undefined) continue;
    const segments = parseRuns(sis[idx]);
    if (segments) idToSegments.set(id, segments);
  }
  return idToSegments;
}
