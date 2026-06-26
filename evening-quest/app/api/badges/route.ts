import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getQuestHistoryList } from "@/lib/models";
import { mockQuestHistory } from "@/lib/mock-data";
import { computeBadges, serializeBadges } from "@/lib/badges";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let quests = mockQuestHistory;

  if (dbAvailable) {
    try {
      quests = await getQuestHistoryList();
    } catch (error) {
      console.error("Ошибка получения истории для бейджей:", error);
    }
  }

  const badges = computeBadges(quests);
  return NextResponse.json(serializeBadges(badges));
}
