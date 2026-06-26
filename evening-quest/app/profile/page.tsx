import { Award } from "lucide-react";
import { isDatabaseAvailable } from "@/lib/db";
import { getQuestHistoryList } from "@/lib/models";
import { mockQuestHistory } from "@/lib/mock-data";
import { computeBadges, serializeBadges } from "@/lib/badges";
import { BadgeList } from "@/components/badge-list";

export default async function ProfilePage() {
  const dbAvailable = await isDatabaseAvailable();
  let quests = mockQuestHistory;

  if (dbAvailable) {
    try {
      quests = await getQuestHistoryList();
    } catch (error) {
      console.error("Ошибка получения истории для профиля:", error);
    }
  }

  const badges = serializeBadges(computeBadges(quests));
  const awardedCount = badges.filter((b) => b.awarded).length;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-background pb-8 pt-12">
        <div className="absolute inset-0 pattern-grid opacity-[0.03]" />
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Award className="h-7 w-7 text-amber-700" />
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-amber-900 sm:text-5xl">
              Профиль
            </h1>
            <p className="text-lg text-muted-foreground">
              Ваши достижения и бейджи за прогулки.
            </p>
          </div>

          <div className="mx-auto mb-8 max-w-md text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2">
              <Award className="h-4 w-4 text-amber-700" />
              <span className="text-sm font-medium text-amber-900">
                {awardedCount} из {badges.length} бейджей получено
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <BadgeList badges={badges} />
      </section>
    </>
  );
}
