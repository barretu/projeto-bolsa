// Days are "YYYY-MM-DD" strings in the browser's time zone.
// Never use toISOString(): it is UTC, so after 21:00 in Brazil it gives tomorrow.

const pad = (n: number) => String(n).padStart(2, "0");

export function toDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(): string {
  return toDay(new Date());
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return toDay(new Date(y, m - 1, d + n));
}

export function formatDay(day: string, locale: string): string {
  const [y, m, d] = day.split("-").map(Number);
  // Built and formatted in UTC so the time zone can never shift the day.
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, d)));
}
