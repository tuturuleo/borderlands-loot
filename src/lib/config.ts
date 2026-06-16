// Настройки сайта. Значения можно переопределить переменными окружения на
// этапе сборки (NEXT_PUBLIC_* инлайнятся в бандл), аналогично SHEET_ID у скрипта.

const SHEET_ID =
  process.env.NEXT_PUBLIC_SHEET_ID ||
  "1v5NE3QnzZ8sgrD88aGJkbXTFRutEKyYn68Qh6xhFIcg";

// Ссылка на исходную гугл-таблицу.
export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

// Email для связи с разработчиком.
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tuturuleo@gmail.com";
