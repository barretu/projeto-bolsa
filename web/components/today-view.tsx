"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, formatDay, today } from "@/lib/dates";

type Task = { id: number; title: string; date: string; done: boolean };

const subscribeNothing = () => () => {};

export function TodayView() {
  const t = useTranslations("Today");
  const locale = useLocale();
  // "Today" must come from the browser clock, so the server renders no day at all.
  const inBrowser = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [offset, setOffset] = useState(0);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const day = inBrowser ? addDays(today(), offset) : null;

  useEffect(() => {
    if (!day) return;
    let cancelled = false;
    fetch(`/api/tasks?date=${day}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: Task[]) => {
        if (!cancelled) setTasks(data);
      })
      .catch(() => {
        if (cancelled) return;
        setTasks([]);
        toast.error(t("loadError"));
      });
    return () => {
      cancelled = true;
    };
  }, [day, t]);

  function go(n: number) {
    setTasks(null);
    setOffset((o) => o + n);
  }

  return (
    <main className="mx-auto w-full max-w-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label={t("previousDay")} onClick={() => go(-1)} disabled={!day}>
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-xl font-semibold">
          {day && (day === today() ? `${t("title")} · ${formatDay(day, locale)}` : formatDay(day, locale))}
        </h1>
        <Button variant="ghost" size="icon" aria-label={t("nextDay")} onClick={() => go(1)} disabled={!day}>
          <ChevronRightIcon />
        </Button>
      </div>

      {tasks === null ? (
        <div className="space-y-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      ) : (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li key={task.id}>
              <label className="flex items-center gap-3 rounded-md px-2 py-1.5">
                <Checkbox checked={task.done} readOnly />
                <span className={task.done ? "text-muted-foreground line-through" : ""}>{task.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
