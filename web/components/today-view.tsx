"use client";

import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, formatDay, today } from "@/lib/dates";

type Task = { id: number; title: string; date: string; done: boolean };

const subscribeNothing = () => () => {};

export function TodayView() {
  const t = useTranslations("Today");
  const errors = useTranslations("errors");
  const locale = useLocale();
  // "Today" must come from the browser clock, so the server renders no day at all.
  const inBrowser = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [offset, setOffset] = useState(0);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [version, setVersion] = useState(0); // bump to reload the list
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
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
  }, [day, t, version]);

  function go(n: number) {
    setTasks(null);
    setOffset((o) => o + n);
  }

  // Calls the API; on failure shows the translated error code and returns false.
  async function send(method: string, url: string, body?: object) {
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
      });
      if (r.ok) return true;
      const code = (await r.json().catch(() => null))?.detail;
      toast.error(typeof code === "string" && errors.has(code) ? errors(code) : errors("UNKNOWN"));
    } catch {
      toast.error(errors("UNKNOWN"));
    }
    return false;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (await send("POST", "/api/tasks", { title, date: day })) {
      setTitle("");
      setVersion((v) => v + 1);
    }
  }

  // The checkbox only changes after the reload, i.e. once the server confirmed.
  async function toggle(task: Task, done: boolean) {
    if (await send("PATCH", `/api/tasks/${task.id}`, { done })) setVersion((v) => v + 1);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (await send("PATCH", `/api/tasks/${editing.id}`, { title: editing.title, date: editing.date })) {
      setEditing(null);
      setVersion((v) => v + 1);
    }
  }

  async function remove() {
    if (!deleting) return;
    if (await send("DELETE", `/api/tasks/${deleting.id}`)) {
      setDeleting(null);
      setVersion((v) => v + 1);
    }
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

      <form onSubmit={add} className="mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("addPlaceholder")}
          aria-label={t("addPlaceholder")}
          disabled={!day}
        />
      </form>

      {tasks === null ? (
        <div className="space-y-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      ) : (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-1">
              <label className="flex flex-1 items-center gap-3 rounded-md px-2 py-1.5">
                <Checkbox checked={task.done} onCheckedChange={(done) => toggle(task, done)} />
                <span className={task.done ? "text-muted-foreground line-through" : ""}>{task.title}</span>
              </label>
              <Button variant="ghost" size="icon-sm" aria-label={t("edit")} onClick={() => setEditing(task)}>
                <PencilIcon />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label={t("delete")} onClick={() => setDeleting(task)}>
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <form onSubmit={save} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{t("editTitle")}</DialogTitle>
            </DialogHeader>
            <label className="grid gap-1.5">
              {t("titleLabel")}
              <Input
                value={editing?.title ?? ""}
                onChange={(e) => setEditing((task) => task && { ...task, title: e.target.value })}
              />
            </label>
            <label className="grid gap-1.5">
              {t("dateLabel")}
              <Input
                type="date"
                required
                value={editing?.date ?? ""}
                onChange={(e) => setEditing((task) => task && { ...task, date: e.target.value })}
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription", { title: deleting?.title ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
