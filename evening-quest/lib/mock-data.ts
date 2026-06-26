// Мок-данные для статического режима (без БД)
// Используются когда USE_DATABASE=false или БД недоступна

import { Service, QuestHistory } from "./models";

export const mockServices: Service[] = [
  {
    id: "mock-service-1",
    name: "API Gateway",
    description: "Шлюз для микросервисной архитектуры",
    status: "active",
    url: "https://api.example.com",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-service-2",
    name: "Auth Service",
    description: "Сервис аутентификации и авторизации",
    status: "active",
    url: "https://auth.example.com",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "mock-service-3",
    name: "ML Pipeline",
    description: "Пайплайн для обработки данных с AI",
    status: "deploying",
    url: undefined,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
];

export const mockQuestHistory: QuestHistory[] = [
  {
    id: "mock-quest-1",
    questName: "Доставить кольцо в Одинокую Башню",
    distanceKm: 2.5,
    elapsedSeconds: 1860,
    completedAt: new Date("2025-06-20T19:30:00Z").toISOString(),
    fromLat: 55.7558,
    fromLng: 37.6173,
    toLat: 55.7651,
    toLng: 37.6051,
    travelledPath: [
      [55.7558, 37.6173],
      [55.7572, 37.6158],
      [55.7585, 37.6142],
      [55.7598, 37.6129],
      [55.7611, 37.6115],
      [55.7624, 37.6101],
      [55.7637, 37.6087],
      [55.7651, 37.6051],
    ],
  },
  {
    id: "mock-quest-2",
    questName: "Найти реликвию в Забытом Храме",
    distanceKm: 1.8,
    elapsedSeconds: 1320,
    completedAt: new Date("2025-06-22T20:00:00Z").toISOString(),
    fromLat: 55.7558,
    fromLng: 37.6173,
    toLat: 55.7525,
    toLng: 37.614,
    travelledPath: [
      [55.7558, 37.6173],
      [55.7549, 37.6165],
      [55.7541, 37.6158],
      [55.7533, 37.615],
      [55.7525, 37.614],
    ],
  },
];
