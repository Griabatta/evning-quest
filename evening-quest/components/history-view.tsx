"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  ScrollText,
  Footprints,
  Clock,
  MapPin,
  History,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { QuestHistory } from "@/lib/models";

const HistoryMapDialog = dynamic(
  () => import("@/components/history-map-detail"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="flex flex-col items-center gap-2 text-amber-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium">Загружаем карту...</span>
        </div>
      </div>
    ),
  }
);

interface HistoryViewProps {
  quests: QuestHistory[];
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) {
    return `${m} мин ${s} сек`;
  }
  return `${s} сек`;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} м`;
  }
  return `${km.toFixed(1)} км`;
}

export function HistoryView({ quests }: HistoryViewProps) {
  const [selectedQuest, setSelectedQuest] = useState<QuestHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenQuest = useCallback((quest: QuestHistory) => {
    setSelectedQuest(quest);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setTimeout(() => setSelectedQuest(null), 200);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-background pb-8 pt-12">
        <div className="absolute inset-0 pattern-grid opacity-[0.03]" />
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <History className="h-7 w-7 text-amber-700" />
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-amber-900 sm:text-5xl">
              История квестов
            </h1>
            <p className="text-lg text-muted-foreground">
              Все ваши завершённые приключения в одном месте.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        {quests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100">
              <ScrollText className="h-7 w-7 text-amber-400" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Пока нет завершённых квестов
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Отправляйтесь в путешествие, чтобы появилась история!
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-2xl gap-4">
            {quests.map((quest) => (
              <Card
                key={quest.id}
                className="cursor-pointer border-amber-200/60 bg-amber-50/40 transition-all hover:border-amber-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500"
                onClick={() => handleOpenQuest(quest)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-base text-amber-900">
                      <ScrollText className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>{quest.questName}</span>
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-amber-200 bg-amber-100/60 text-xs text-amber-700"
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(quest.completedAt)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        {formatDistance(quest.distanceKm)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        {formatTime(quest.elapsedSeconds)}
                      </span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-muted-foreground">
                        Нажмите, чтобы посмотреть маршрут
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900">
              <ScrollText className="h-4 w-4 text-amber-600" />
              {selectedQuest?.questName}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              {selectedQuest ? formatDate(selectedQuest.completedAt) : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedQuest && (
            <HistoryMapDialog
              fromLat={selectedQuest.fromLat}
              fromLng={selectedQuest.fromLng}
              toLat={selectedQuest.toLat}
              toLng={selectedQuest.toLng}
              travelledPath={selectedQuest.travelledPath}
            />
          )}

          <div className="flex items-center justify-center gap-6 rounded-lg bg-amber-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">Старт</span>
            </div>
            <Separator orientation="horizontal" className="w-8 bg-amber-300" />
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">
                {selectedQuest ? formatDistance(selectedQuest.distanceKm) : ""}
              </span>
            </div>
            <Separator orientation="horizontal" className="w-8 bg-amber-300" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">
                {selectedQuest ? formatTime(selectedQuest.elapsedSeconds) : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-red-100">
                <MapPin className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-xs text-muted-foreground">Цель</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleCloseDialog}
            className="mt-2"
          >
            Закрыть
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
