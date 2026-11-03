import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["pt-BR", "en"] as const;

export default getRequestConfig(async () => {
  const cookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const browser = (await headers()).get("accept-language") ?? "";
  const locale = locales.find((l) => l === cookie)
    ?? (browser.toLowerCase().startsWith("pt") ? "pt-BR" : "en");

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
