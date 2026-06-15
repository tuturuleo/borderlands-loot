/**
 * Скачивание картинок предметов.
 *
 * Для предметов со ссылкой на lootlemon достаём og:image со страницы
 * и сохраняем картинку локально в public/items (самохостинг, без хотлинка).
 * У кого ссылки нет — image остаётся null, в UI рисуется плейсхолдер.
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

// Достаём og:image со страницы предмета lootlemon.
async function resolveImageUrl(pageUrl: string): Promise<string | null> {
  const res = await fetch(pageUrl, { redirect: "follow" });
  if (!res.ok) return null;
  const html = await res.text();
  const m =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );
  return m ? m[1] : null;
}

function extFromUrl(url: string): string {
  const m = url.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "avif";
}

async function downloadOne(
  item: LootItem,
  root: string,
): Promise<void> {
  if (!item.lootlemonUrl) return; // нет источника → плейсхолдер в UI

  const slug = imageSlug(item);
  const imagesDir = path.join(root, PUBLIC_DIR, IMAGES_SUBDIR);

  // Уже скачано (любое расширение)? — переиспользуем.
  for (const ext of ["avif", "webp", "png", "jpg", "jpeg"]) {
    const candidate = path.join(imagesDir, `${slug}.${ext}`);
    if (existsSync(candidate)) {
      item.image = `/${IMAGES_SUBDIR}/${slug}.${ext}`;
      return;
    }
  }

  try {
    const imgUrl = await resolveImageUrl(item.lootlemonUrl);
    if (!imgUrl) {
      console.warn(`  · нет og:image: ${item.nameEn || item.name}`);
      return;
    }
    const res = await fetch(imgUrl, { redirect: "follow" });
    if (!res.ok) {
      console.warn(`  · картинка ${res.status}: ${item.nameEn || item.name}`);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = extFromUrl(imgUrl);
    const file = path.join(imagesDir, `${slug}.${ext}`);
    await writeFile(file, buf);
    item.image = `/${IMAGES_SUBDIR}/${slug}.${ext}`;
    console.log(`  ↓ ${item.nameEn || item.name} → ${slug}.${ext}`);
  } catch (err) {
    console.warn(
      `  · ошибка картинки (${item.nameEn || item.name}):`,
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
  console.log(
    `→ Картинки: ${withLinks.length} предметов со ссылкой на lootlemon`,
  );
  await mkdir(path.join(root, PUBLIC_DIR, IMAGES_SUBDIR), { recursive: true });
  await runPool(items, (i) => downloadOne(i, root), CONCURRENCY);
  const got = items.filter((i) => i.image).length;
  console.log(`✓ Картинок готово: ${got}/${items.length}`);
}
