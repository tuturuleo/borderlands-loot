/**
 * Скачивание картинок предметов.
 *
 * У каждого предмета на lootlemon два изображения:
 *   • <img id="page-image">  — простой чистый рендер  → в список (item.image);
 *   • <img id="item-card">   — детальная карточка со статами → на детальную (item.imageCard).
 * Обе скачиваем локально в public/items (самохостинг, без хотлинка).
 * Ссылка на страницу берётся из item.lootlemonUrl (колонка «Имя»).
 *
 * Повторные запуски пропускают уже скачанные файлы.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSlug } from "../src/lib/normalize";
import type { LootItem } from "../src/lib/types";

const PUBLIC_DIR = "public";
const IMAGES_SUBDIR = "items";
const CONCURRENCY = 6;
const EXTS = ["avif", "webp", "png", "jpg", "jpeg"];

// Достаём src у <img> с нужным id (атрибуты в любом порядке).
function imgSrcById(html: string, id: string): string | null {
  const tag = html.match(new RegExp(`<img[^>]*\\bid="${id}"[^>]*>`, "i"));
  if (!tag) return null;
  const src = tag[0].match(/\bsrc="([^"]+)"/i);
  return src ? src[1] : null;
}

function metaContent(html: string, key: string, attr: string): string | null {
  const m =
    html.match(
      new RegExp(`<meta[^>]+${attr}="${key}"[^>]+content="([^"]+)"`, "i"),
    ) ??
    html.match(
      new RegExp(`<meta[^>]+content="([^"]+)"[^>]+${attr}="${key}"`, "i"),
    );
  return m ? m[1] : null;
}

// Возвращает { simple, card } — URL чистого рендера и карточки.
async function resolveImageUrls(
  pageUrl: string,
): Promise<{ simple: string | null; card: string | null }> {
  const res = await fetch(pageUrl, { redirect: "follow" });
  if (!res.ok) return { simple: null, card: null };
  const html = await res.text();
  const simple =
    imgSrcById(html, "page-image") ?? metaContent(html, "thumbnail", "name");
  const card =
    imgSrcById(html, "item-card") ?? metaContent(html, "og:image", "property");
  return { simple, card };
}

function extFromUrl(url: string): string {
  const m = url.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "avif";
}

// Уже скачанный файл (любое расширение) → публичный путь, иначе null.
function findExisting(imagesDir: string, name: string): string | null {
  for (const ext of EXTS) {
    if (existsSync(path.join(imagesDir, `${name}.${ext}`))) {
      return `/${IMAGES_SUBDIR}/${name}.${ext}`;
    }
  }
  return null;
}

async function download(
  url: string,
  imagesDir: string,
  name: string,
): Promise<string | null> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrl(url);
  await writeFile(path.join(imagesDir, `${name}.${ext}`), buf);
  return `/${IMAGES_SUBDIR}/${name}.${ext}`;
}

async function processItem(item: LootItem, root: string): Promise<void> {
  if (!item.lootlemonUrl) return; // нет страницы → плейсхолдер в UI

  const slug = imageSlug(item);
  const imagesDir = path.join(root, PUBLIC_DIR, IMAGES_SUBDIR);

  // Переиспользуем уже скачанное.
  item.image = findExisting(imagesDir, slug);
  item.imageCard = findExisting(imagesDir, `${slug}-card`);
  if (item.image && item.imageCard) return;

  try {
    const { simple, card } = await resolveImageUrls(item.lootlemonUrl);
    if (!item.image && simple) {
      item.image = await download(simple, imagesDir, slug);
    }
    if (!item.imageCard && card) {
      item.imageCard = await download(card, imagesDir, `${slug}-card`);
    }
    if (!item.image && !item.imageCard) {
      console.warn(`  · нет картинок: ${item.nameEn || item.name}`);
    } else {
      console.log(`  ↓ ${item.nameEn || item.name}`);
    }
  } catch (err) {
    console.warn(
      `  · ошибка картинок (${item.nameEn || item.name}):`,
      (err as Error).message,
    );
  }
}

// Простой пул с ограничением параллелизма.
async function runPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let i = 0;
  async function next(): Promise<void> {
    const idx = i++;
    if (idx >= items.length) return;
    await worker(items[idx]);
    return next();
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, next),
  );
}

export async function fetchImages(
  items: LootItem[],
  root: string,
): Promise<void> {
  const withLinks = items.filter((i) => i.lootlemonUrl);
  console.log(`→ Картинки: ${withLinks.length} предметов со ссылкой`);
  await mkdir(path.join(root, PUBLIC_DIR, IMAGES_SUBDIR), { recursive: true });
  await runPool(items, (i) => processItem(i, root), CONCURRENCY);
  const simple = items.filter((i) => i.image).length;
  const card = items.filter((i) => i.imageCard).length;
  console.log(`✓ Простых: ${simple}, карточек: ${card} из ${items.length}`);
}
