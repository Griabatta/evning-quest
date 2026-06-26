"use client";

import { Trophy, MapPin, Clock, Footprints, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestCompletionProps {
  questName: string;
  distanceKm: number;
  elapsedSeconds: number;
  congratulation: string;
  onNewQuest: () => void;
}

export function QuestCompletion({
  questName,
  distanceKm,
  elapsedSeconds,
  congratulation,
  onNewQuest,
}: QuestCompletionProps) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="mx-4 w-full max-w-md border-amber-200/60 bg-gradient-to-b from-amber-50 to-orange-50 shadow-xl">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-amber-100">
            <Trophy className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            Квест завершён!
          </CardTitle>
          <p className="mt-1 text-sm leading-relaxed text-amber-700">
            {congratulation}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-100/60 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Название квеста</p>
            <p className="mt-0.5 flex items-center justify-center gap-2 font-semibold text-amber-900">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {questName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
              <Footprints className="h-5 w-5 text-amber-700" />
              <div>
                <p className="text-xs text-muted-foreground">Дистанция</p>
                <p className="text-lg font-semibold text-amber-900">
                  {distanceKm < 1
                    ? `${Math.round(distanceKm * 1000)} м`
                    : `${distanceKm.toFixed(1)} км`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
              <Clock className="h-5 w-5 text-amber-700" />
              <div>
                <p className="text-xs text-muted-foreground">Время</p>
                <p className="text-lg font-semibold text-amber-900">
                  {minutes > 0
                    ? `${minutes} мин ${seconds} сек`
                    : `${seconds} сек`}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onNewQuest}
            className="w-full gap-2 bg-amber-600 text-white hover:bg-amber-700"
          >
            <MapPin className="size-4" />
            Новое приключение
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
