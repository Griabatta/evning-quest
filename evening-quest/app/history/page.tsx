"use client";

import { useSyncExternalStore } from "react";
import { getQuestHistoryFromStorage } from "@/lib/storage";
import { HistoryView } from "@/components/history-view";
import type { QuestHistory } from "@/lib/models";

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot(): QuestHistory[] {
  return [];
}

export default function HistoryPage() {
  const quests = useSyncExternalStore(
    subscribeToStorage,
    getQuestHistoryFromStorage,
    getServerSnapshot
  );

  return <HistoryView quests={quests} />;
}
