import { isDatabaseAvailable } from "@/lib/db";
import { getQuestHistoryList } from "@/lib/models";
import { mockQuestHistory } from "@/lib/mock-data";
import { HistoryView } from "@/components/history-view";

export default async function HistoryPage() {
  const dbAvailable = await isDatabaseAvailable();
  let quests = mockQuestHistory;

  if (dbAvailable) {
    try {
      quests = await getQuestHistoryList();
    } catch (error) {
      console.error("Ошибка получения истории квестов:", error);
    }
  }

  return <HistoryView quests={quests} />;
}
