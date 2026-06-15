import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// На GitHub Pages сайт живёт по подпути /<repo>. next/image не добавляет basePath
// к локальным src, поэтому путям к ассетам в /public префикс ставим вручную.
// Значение инлайнится в бандл на этапе сборки (см. деплой-воркфлоу).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function assetPath(p: string): string {
  return p.startsWith("/") ? `${BASE_PATH}${p}` : p
}
