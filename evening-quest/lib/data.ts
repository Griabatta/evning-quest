export interface Landmark {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  category: "cafe" | "park" | "monument";
}

export interface LandmarkCategory {
  value: Landmark["category"];
  label: string;
  icon: string;
  color: string;
}

export const landmarkCategories: Record<
  Landmark["category"],
  LandmarkCategory
> = {
  cafe: { value: "cafe", label: "Кафе", icon: "☕", color: "#d97706" },
  park: { value: "park", label: "Парк", icon: "🌳", color: "#65a30d" },
  monument: {
    value: "monument",
    label: "Памятник",
    icon: "🏛️",
    color: "#b45309",
  },
};

export const landmarks: Landmark[] = [
  {
    id: "cafe-1",
    name: "Кофейня «Уют»",
    description: "Уютное место с тёплым чаем и домашней выпечкой",
    coordinates: [55.758, 37.612],
    category: "cafe",
  },
  {
    id: "cafe-2",
    name: "Чайная «Самовар»",
    description: "Традиционная русская чайная с видом на Кремль",
    coordinates: [55.752, 37.625],
    category: "cafe",
  },
  {
    id: "park-1",
    name: "Парк Горького",
    description: "Центральный парк с аллеями и набережной",
    coordinates: [55.7289, 37.6036],
    category: "park",
  },
  {
    id: "park-2",
    name: "Александровский сад",
    description: "Тихий сад у стен Кремля с фонтанами",
    coordinates: [55.7525, 37.614],
    category: "park",
  },
  {
    id: "monument-1",
    name: "Памятник Пушкину",
    description: "Знаменитый памятник на Тверском бульваре",
    coordinates: [55.7651, 37.6051],
    category: "monument",
  },
];

export const mapCenter: [number, number] = [55.7558, 37.6173];
export const mapZoom = 13;

const questPrefixes = [
  "Доставить кольцо",
  "Найти реликвию",
  "Спасти принцессу",
  "Отыскать артефакт",
  "Пробудить древнего",
  "Защитить караван",
  "Разгадать руны",
  "Вернуть амулет",
  "Провести обряд",
  "Отнести свиток",
  "Найти убежище",
  "Закрыть портал",
];

const questSuffixes = [
  "в Одинокую Башню",
  "в Забытый Храм",
  "в Тёмный Лес",
  "в Пещеру Дракона",
  "к Озеру Туманов",
  "на Перевал Ветров",
  "в Старую Крепость",
  "к Замку Теней",
  "в Глубины Земли",
  "к Подвесному Мосту",
  "на Поляну Фей",
  "к Камню Судеб",
];

const congratulationMessages = [
  "Миссия выполнена! Легенда о вашем подвиге разнесётся по всем землям.",
  "Славный путь завершён! Ваше имя вписано в скрижали истории.",
  "Великий странник! Ещё одно приключение покорилось вашей воле.",
  "Задание выполнено с честью! Пусть этот путь запомнится надолго.",
  "Вы достигли цели! Путеводная звезда вела вас верной дорогой.",
  "Подвиг свершён! Пусть ветер странствий всегда дует вам в спину.",
  "Цель достигнута! Ваша отвага достойна саг и сказаний.",
  "Ещё одна глава вашего приключения завершена. До новых встреч на тропе!",
];

export function generateQuestName(): string {
  const prefix =
    questPrefixes[Math.floor(Math.random() * questPrefixes.length)];
  const suffix =
    questSuffixes[Math.floor(Math.random() * questSuffixes.length)];
  return `${prefix} ${suffix}`;
}

export function generateCongratulation(): string {
  return congratulationMessages[
    Math.floor(Math.random() * congratulationMessages.length)
  ];
}

export function calculateDistance(
  from: [number, number],
  to: [number, number]
): number {
  const R = 6371;
  const dLat = ((to[0] - from[0]) * Math.PI) / 180;
  const dLon = ((to[1] - from[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from[0] * Math.PI) / 180) *
      Math.cos((to[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateTimeMinutes(distanceKm: number): number {
  const walkingSpeedKmh = 5;
  return Math.max(1, Math.round((distanceKm / walkingSpeedKmh) * 60));
}

export function interpolatePosition(
  from: [number, number],
  to: [number, number],
  fraction: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * fraction,
    from[1] + (to[1] - from[1]) * fraction,
  ];
}
