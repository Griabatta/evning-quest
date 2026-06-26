import type { QuestHistory } from "./models";

export interface BadgeDefinition {
  id: string;
  name: string;
  iconName: string;
  description: string;
  check: (quests: QuestHistory[]) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_quest",
    name: "Первый шаг",
    iconName: "Footprints",
    description: "Завершите свой первый квест",
    check: (quests) => quests.length >= 1,
  },
  {
    id: "explorer_5",
    name: "Исследователь",
    iconName: "Compass",
    description: "Завершите 5 квестов",
    check: (quests) => quests.length >= 5,
  },
  {
    id: "pathfinder_10",
    name: "Следопыт",
    iconName: "MapPin",
    description: "Завершите 10 квестов",
    check: (quests) => quests.length >= 10,
  },
  {
    id: "marathon",
    name: "Марафонец",
    iconName: "Trophy",
    description: "Пройдите 5 км за один квест",
    check: (quests) => quests.some((q) => q.distanceKm >= 5),
  },
  {
    id: "traveler",
    name: "Путешественник",
    iconName: "Globe",
    description: "Пройдите в сумме 10 км",
    check: (quests) => quests.reduce((s, q) => s + q.distanceKm, 0) >= 10,
  },
  {
    id: "speedster",
    name: "Скороход",
    iconName: "Zap",
    description: "Завершите квест быстрее 10 минут",
    check: (quests) => quests.some((q) => q.elapsedSeconds < 600),
  },
  {
    id: "streak_3",
    name: "Три дня подряд",
    iconName: "CalendarDays",
    description: "Гуляйте 3 дня подряд",
    check: (quests) => maxStreak(quests) >= 3,
  },
  {
    id: "streak_7",
    name: "Неделя приключений",
    iconName: "Star",
    description: "Гуляйте 7 дней подряд",
    check: (quests) => maxStreak(quests) >= 7,
  },
  {
    id: "night_owl",
    name: "Ночная сова",
    iconName: "Moon",
    description: "Завершите квест после заката (после 20:00)",
    check: (quests) =>
      quests.some((q) => {
        const hour = new Date(q.completedAt).getUTCHours();
        return hour >= 17;
      }),
  },
];

function maxStreak(quests: QuestHistory[]): number {
  if (quests.length === 0) return 0;

  const uniqueDays = [
    ...new Set(quests.map((q) => q.completedAt.split("T")[0])),
  ].sort();

  let maxLen = 1;
  let cur = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1] + "T00:00:00Z");
    const curr = new Date(uniqueDays[i] + "T00:00:00Z");
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      cur++;
      if (cur > maxLen) maxLen = cur;
    } else {
      cur = 1;
    }
  }

  return maxLen;
}

export interface BadgeWithStatus extends BadgeDefinition {
  awarded: boolean;
}

export interface SerializableBadge {
  id: string;
  name: string;
  iconName: string;
  description: string;
  awarded: boolean;
}

export function computeBadges(quests: QuestHistory[]): BadgeWithStatus[] {
  return BADGE_DEFINITIONS.map((b) => ({ ...b, awarded: b.check(quests) }));
}

export function serializeBadges(
  badges: BadgeWithStatus[]
): SerializableBadge[] {
  return badges.map(({ check: _, ...rest }) => rest);
}

export function findNewBadges(
  before: QuestHistory[],
  after: QuestHistory[]
): BadgeDefinition[] {
  const prev = computeBadges(before);
  const curr = computeBadges(after);
  return curr
    .filter((c) => {
      const p = prev.find((x) => x.id === c.id);
      return p && !p.awarded && c.awarded;
    })
    .map(({ awarded: _, ...badge }) => badge);
}
