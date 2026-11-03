"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const options = [
  { locale: "pt-BR", label: "PT" },
  { locale: "en", label: "EN" },
];

function saveLocale(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher() {
  const current = useLocale();
  const router = useRouter();
  const t = useTranslations("Header");

  function choose(locale: string) {
    saveLocale(locale);
    router.refresh();
  }

  return (
    <div role="group" aria-label={t("language")} className="flex gap-1">
      {options.map(({ locale, label }) => (
        <Button
          key={locale}
          size="sm"
          variant={locale === current ? "secondary" : "ghost"}
          aria-pressed={locale === current}
          onClick={() => choose(locale)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
