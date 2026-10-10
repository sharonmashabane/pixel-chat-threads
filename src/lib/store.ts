import { useSyncExternalStore } from "react";
import type { UIMessage } from "ai";

export type Thread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };
export type ActivityType = "plan" | "research" | "chat";
export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: number;
  content?: string;
  threadId?: string;
};
export type Settings = {
  name: string;
  style: "concise" | "balanced" | "detailed";
  defaultSchedule: "Daily" | "Weekly";
};

const KEYS = { threads: "mf.threads", activity: "mf.activity", settings: "mf.settings" } as const;
const DEFAULT_SETTINGS: Settings = { name: "", style: "balanced", defaultSchedule: "Daily" };
const EMPTY: never[] = [];

const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    value = fallback;
  }
  cache.set(key, value);
  return value;
}

function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full — keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key) cache.delete(e.key);
    l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function useKey<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);

// Threads
export const useThreads = () => useKey<Thread[]>(KEYS.threads, EMPTY);
export const getThreads = () => read<Thread[]>(KEYS.threads, EMPTY);
export const getThread = (id: string) => getThreads().find((t) => t.id === id);

export function createThread(): Thread {
  const thread: Thread = { id: uid(), title: "New conversation", updatedAt: Date.now(), messages: [] };
  write(KEYS.threads, [thread, ...getThreads()]);
  return thread;
}

export function saveThreadMessages(id: string, messages: UIMessage[]) {
  const threads = getThreads();
  const existing = threads.find((t) => t.id === id);
  if (!existing) return;
  let title = existing.title;
  if (title === "New conversation") {
    const first = messages.find((m) => m.role === "user");
    const text = first?.parts.find((p) => p.type === "text");
    if (text && "text" in text) {
      title = text.text.slice(0, 60);
      logActivity({ type: "chat", title: `Chat: ${title}`, threadId: id });
    }
  }
  write(
    KEYS.threads,
    threads
      .map((t) => (t.id === id ? { ...t, title, messages, updatedAt: Date.now() } : t))
      .sort((a, b) => b.updatedAt - a.updatedAt),
  );
}

export function deleteThread(id: string) {
  write(
    KEYS.threads,
    getThreads().filter((t) => t.id !== id),
  );
}

// Activity
export const useActivity = () => useKey<Activity[]>(KEYS.activity, EMPTY);
export function logActivity(a: Omit<Activity, "id" | "createdAt">) {
  const list = read<Activity[]>(KEYS.activity, EMPTY);
  write(KEYS.activity, [{ ...a, id: uid(), createdAt: Date.now() }, ...list].slice(0, 200));
}
export function deleteActivity(id: string) {
  write(
    KEYS.activity,
    read<Activity[]>(KEYS.activity, EMPTY).filter((a) => a.id !== id),
  );
}

// Settings
export const useSettings = () => useKey<Settings>(KEYS.settings, DEFAULT_SETTINGS);
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...read<Settings>(KEYS.settings, DEFAULT_SETTINGS) });
export const saveSettings = (s: Settings) => write(KEYS.settings, s);

export function clearAll() {
  write(KEYS.threads, []);
  write(KEYS.activity, []);
}

export function messageText(m: UIMessage) {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}
