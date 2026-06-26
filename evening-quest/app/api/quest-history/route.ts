import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { saveQuestHistory, getQuestHistoryList } from "@/lib/models";
import { mockQuestHistory } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const quests = await getQuestHistoryList();
      return NextResponse.json(quests);
    } catch (error) {
      console.error("Ошибка получения истории квестов:", error);
      return NextResponse.json(
        { error: "Ошибка получения данных из DynamoDB" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(mockQuestHistory);
}

export async function POST(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна в статическом режиме" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    if (!body.questName) {
      return NextResponse.json(
        { error: "Поле questName обязательно" },
        { status: 400 }
      );
    }

    const quest = await saveQuestHistory({
      questName: body.questName,
      distanceKm: body.distanceKm,
      elapsedSeconds: body.elapsedSeconds,
      fromLat: body.fromLat,
      fromLng: body.fromLng,
      toLat: body.toLat,
      toLng: body.toLng,
      travelledPath: body.travelledPath ?? [],
    });

    return NextResponse.json(quest, { status: 201 });
  } catch (error) {
    console.error("Ошибка сохранения квеста:", error);
    return NextResponse.json(
      { error: "Ошибка сохранения квеста" },
      { status: 500 }
    );
  }
}
