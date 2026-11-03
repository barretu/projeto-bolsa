import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Today");

  return (
    <main className="mx-auto w-full max-w-xl p-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </main>
  );
}
