// Настройки сайта. Значения можно переопределить переменными окружения на
// этапе сборки (NEXT_PUBLIC_* инлайнятся в бандл), аналогично SHEET_ID у скрипта.

const SHEET_ID =
  process.env.NEXT_PUBLIC_SHEET_ID ||
  "1ZxbOGnJveB4a5Lju3Xy33_ff1XOSEnujtmgBl4h6zuE";

// Ссылка на исходную гугл-таблицу.
export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

// Email для связи с разработчиком.
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tuturuleo@gmail.com";
