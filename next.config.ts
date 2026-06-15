import type { NextConfig } from "next";
import path from "node:path";

// На GitHub Pages сайт живёт по подпути /<имя-репо>. Деплой-воркфлоу передаёт
// его через BASE_PATH; локально переменная пуста — сайт работает в корне.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  // Корень проекта (в родительской папке есть чужой lockfile — фиксируем явно).
  turbopack: { root: path.resolve(__dirname) },
  // Полностью статический экспорт — кладётся на любой бесплатный хостинг.
  output: "export",
  basePath: basePath || undefined,
  images: {
    // next/image не может оптимизировать на лету в static export — отдаём как есть.
    unoptimized: true,
  },
  // Чтобы ссылки вида /item/foo резолвились как /item/foo/index.html на статике.
  trailingSlash: true,
};

export default nextConfig;
