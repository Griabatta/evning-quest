"use client";

import type { QuestHistory } from "./models";

const STORAGE_KEY = "evening-quest-history";

export function getQuestHistoryFromStorage(): QuestHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuestHistory[];
  } catch {
    return [];
  }
}

export function saveQuestToStorage(quest: QuestHistory): void {
  if (typeof window === "undefined") return;
  try {
    const list = getQuestHistoryFromStorage();
    list.unshift(quest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    console.error("Не удалось сохранить квест в localStorage");
  }
}
