"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  MapPin,
  Crosshair,
  Footprints,
  ScrollText,
  Play,
  Target,
  Clock,
  Flag,
  Navigation,
  CheckCircle2,
  AlertCircle,
  X,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  landmarks,
  mapCenter,
  generateQuestName,
  generateCongratulation,
  calculateDistance,
  estimateTimeMinutes,
} from "@/lib/data";
import { QuestCompletion } from "./quest-completion";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/use-geolocation";
import { saveQuestToStorage } from "@/lib/storage";
import type { SerializableBadge } from "@/lib/badges";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="flex flex-col items-center gap-3 text-amber-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-medium">Загружаем карту...</span>
      </div>
    </div>
  ),
});

const AUTO_COMPLETE_RADIUS_KM = 0.05;

interface TrackingState {
  currentPosition: [number, number] | null;
  travelledPath: [number, number][];
  progressFraction: number;
  distanceTraveled: number;
}

type TrackingAction =
  | { type: "INIT"; position: [number, number] }
  | {
      type: "UPDATE";
      position: [number, number];
      segmentDistance: number;
      totalDistance: number;
    }
  | { type: "RESET" };

function trackingReducer(
  state: TrackingState,
  action: TrackingAction
): TrackingState {
  switch (action.type) {
    case "INIT":
      return {
        currentPosition: action.position,
        travelledPath: [action.position],
        progressFraction: 0,
        distanceTraveled: 0,
      };
    case "UPDATE": {
      const newAccumulated = state.distanceTraveled + action.segmentDistance;
      return {
        currentPosition: action.position,
        travelledPath: [...state.travelledPath, action.position],
        progressFraction:
          action.totalDistance > 0
            ? Math.min(newAccumulated / action.totalDistance, 1)
            : 0,
        distanceTraveled: newAccumulated,
      };
    }
    case "RESET":
      return {
        currentPosition: null,
        travelledPath: [],
        progressFraction: 0,
        distanceTraveled: 0,
      };
  }
}

export function MapView() {
  const geo = useGeolocation();
  const locate = geo.locate;

  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualCoords, setManualCoords] = useState<[number, number] | null>(
    null
  );
  const [showManualInput, setShowManualInput] = useState(false);

  const startPosition: [number, number] =
    geo.coords ?? manualCoords ?? mapCenter;

  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(
    null
  );
  const [customMarker, setCustomMarker] = useState<[number, number] | null>(
    null
  );
  const [questName, setQuestName] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingState, dispatchTracking] = useReducer(trackingReducer, {
    currentPosition: null,
    travelledPath: [],
    progressFraction: 0,
    distanceTraveled: 0,
  });
  const { currentPosition, travelledPath, progressFraction, distanceTraveled } =
    trackingState;
  const [showCompletion, setShowCompletion] = useState(false);
  const [congratulation, setCongratulation] = useState("");
  const [completedElapsedSeconds, setCompletedElapsedSeconds] = useState(0);
  const [completedDistanceKm, setCompletedDistanceKm] = useState(0);
  const questNameRef = useRef<string | null>(null);
  const questSavedRef = useRef(false);
  const questStartTimeRef = useRef<number | null>(null);
  const badgesBeforeRef = useRef<SerializableBadge[]>([]);

  const isTrackingRef = useRef(false);
  const targetCoordsRef = useRef<[number, number] | null>(null);
  const totalDistanceRef = useRef(0);
  const accumulatedDistanceRef = useRef(0);
  const lastPositionRef = useRef<[number, number] | null>(null);
  const autoCompletedRef = useRef(false);

  const targetCoords: [number, number] | null = useMemo(() => {
    const selected = selectedLandmarkId
      ? (landmarks.find((l) => l.id === selectedLandmarkId) ?? null)
      : null;
    return selected?.coordinates ?? customMarker;
  }, [selectedLandmarkId, customMarker]);

  const totalDistance = useMemo(
    () =>
      targetCoords !== null
        ? calculateDistance(startPosition, targetCoords)
        : null,
    [targetCoords, startPosition]
  );

  const estimatedTime = useMemo(
    () => (totalDistance !== null ? estimateTimeMinutes(totalDistance) : null),
    [totalDistance]
  );

  const distanceRemaining = useMemo(
    () =>
      totalDistance !== null
        ? Math.max(0, totalDistance - distanceTraveled)
        : null,
    [totalDistance, distanceTraveled]
  );

  const elapsedMin =
    estimatedTime !== null
      ? Math.floor((estimatedTime * progressFraction) / 60)
      : 0;
  const elapsedSec =
    estimatedTime !== null
      ? Math.floor((estimatedTime * progressFraction) % 60)
      : 0;

  const timeRemaining = useMemo(
    () =>
      estimatedTime !== null
        ? Math.max(0, Math.round(estimatedTime * (1 - progressFraction)))
        : null,
    [estimatedTime, progressFraction]
  );

  useEffect(() => {
    fetch("/api/badges")
      .then((r) => r.json())
      .then((data: SerializableBadge[]) => {
        badgesBeforeRef.current = data;
      })
      .catch(() => {});
  }, []);

  const stopGpsAndCleanup = useCallback(() => {
    if (geo.isWatching) {
      geo.stopWatching();
    }
    isTrackingRef.current = false;
    lastPositionRef.current = null;
  }, [geo]);

  const saveQuest = useCallback(
    (distanceKm: number, elapsedSeconds: number) => {
      if (questSavedRef.current || !questName || !targetCoordsRef.current)
        return;
      questSavedRef.current = true;

      const before = badgesBeforeRef.current;
      const path = travelledPath;
      const questData = {
        questName,
        distanceKm,
        elapsedSeconds,
        fromLat: startPosition[0],
        fromLng: startPosition[1],
        toLat: targetCoordsRef.current[0],
        toLng: targetCoordsRef.current[1],
        travelledPath: path,
      };

      const localQuest = {
        id: crypto.randomUUID(),
        ...questData,
        completedAt: new Date().toISOString(),
      };
      saveQuestToStorage(localQuest);

      fetch("/api/quest-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questData),
      })
        .then(() => {
          fetch("/api/badges")
            .then((r) => r.json())
            .then((data: SerializableBadge[]) => {
              const newBadges = data.filter(
                (b) =>
                  b.awarded && !before.find((x) => x.id === b.id && x.awarded)
              );
              newBadges.forEach((badge) => {
                toast.success(`Получен бейдж: ${badge.name}`, {
                  description: badge.description,
                  duration: 5000,
                });
              });
            })
            .catch(() => {});
        })
        .catch(() => {});
    },
    [questName, startPosition, travelledPath]
  );

  const completeQuest = useCallback(() => {
    stopGpsAndCleanup();
    setIsTracking(false);

    const elapsed = questStartTimeRef.current
      ? Math.round((Date.now() - questStartTimeRef.current) / 1000)
      : 0;
    const fullDistance = totalDistanceRef.current;
    setCompletedElapsedSeconds(elapsed);
    setCompletedDistanceKm(fullDistance);

    saveQuest(fullDistance, elapsed);

    setTimeout(() => {
      setCongratulation(generateCongratulation());
      setShowCompletion(true);
    }, 600);
  }, [stopGpsAndCleanup, saveQuest]);

  useEffect(() => {
    if (!isTrackingRef.current || !geo.coords) return;

    const newPos = geo.coords;
    const lastPos = lastPositionRef.current;

    if (lastPos) {
      const segmentDistance = calculateDistance(lastPos, newPos);
      accumulatedDistanceRef.current =
        accumulatedDistanceRef.current + segmentDistance;

      dispatchTracking({
        type: "UPDATE",
        position: newPos,
        segmentDistance,
        totalDistance: totalDistanceRef.current,
      });

      const distToTarget = calculateDistance(newPos, targetCoordsRef.current!);

      if (
        distToTarget <= AUTO_COMPLETE_RADIUS_KM &&
        !autoCompletedRef.current
      ) {
        autoCompletedRef.current = true;
        setTimeout(() => completeQuest(), 0);
      }
    } else {
      lastPositionRef.current = newPos;
      dispatchTracking({ type: "INIT", position: newPos });
    }
  }, [geo.coords, completeQuest]);

  useEffect(() => {
    return () => {
      if (geo.isWatching) {
        geo.stopWatching();
      }
    };
  }, [geo]);

  const startRealTracking = useCallback(() => {
    if (!targetCoords || totalDistance === null) return;

    questSavedRef.current = false;
    autoCompletedRef.current = false;

    const startPos = geo.coords ?? manualCoords ?? mapCenter;
    lastPositionRef.current = null;
    accumulatedDistanceRef.current = 0;
    isTrackingRef.current = true;
    targetCoordsRef.current = targetCoords;
    totalDistanceRef.current = totalDistance;

    dispatchTracking({ type: "INIT", position: startPos });
    setIsTracking(true);
    setShowCompletion(false);
    setCongratulation("");
    questStartTimeRef.current = Date.now();

    geo.startWatching();
  }, [targetCoords, totalDistance, geo, manualCoords]);

  const handleNewQuest = useCallback(() => {
    setShowCompletion(false);
    setCongratulation("");
    stopGpsAndCleanup();
    setIsTracking(false);
    dispatchTracking({ type: "RESET" });
    accumulatedDistanceRef.current = 0;
    setSelectedLandmarkId(null);
    setCustomMarker(null);
    setQuestName(null);
    questNameRef.current = null;
  }, [stopGpsAndCleanup]);

  const handleSelectLandmark = useCallback(
    (id: string) => {
      stopGpsAndCleanup();
      setIsTracking(false);
      dispatchTracking({ type: "RESET" });
      accumulatedDistanceRef.current = 0;
      setSelectedLandmarkId(id);
      setCustomMarker(null);
      const name = generateQuestName();
      questNameRef.current = name;
      setQuestName(name);
    },
    [stopGpsAndCleanup]
  );

  const handlePlaceMarker = useCallback(
    (coords: [number, number]) => {
      stopGpsAndCleanup();
      setIsTracking(false);
      dispatchTracking({ type: "RESET" });
      accumulatedDistanceRef.current = 0;
      setCustomMarker(coords);
      setSelectedLandmarkId(null);
      const name = generateQuestName();
      questNameRef.current = name;
      setQuestName(name);
    },
    [stopGpsAndCleanup]
  );

  const handleStartQuest = useCallback(() => {
    if (!questNameRef.current) {
      questNameRef.current = generateQuestName();
    }
    setQuestName(questNameRef.current);
    setCongratulation("");
    startRealTracking();
  }, [startRealTracking]);

  const handleStopQuest = useCallback(() => {
    stopGpsAndCleanup();
    setIsTracking(false);

    const elapsed = questStartTimeRef.current
      ? Math.round((Date.now() - questStartTimeRef.current) / 1000)
      : 0;
    const traveled = accumulatedDistanceRef.current;
    setCompletedElapsedSeconds(elapsed);
    setCompletedDistanceKm(traveled);

    if (traveled > 0) {
      saveQuest(traveled, elapsed);
    }

    setTimeout(() => {
      setCongratulation(
        traveled > 0
          ? "Путь прерван. Пройденный участок сохранён."
          : "Путь не начат."
      );
      setShowCompletion(true);
    }, 600);
  }, [stopGpsAndCleanup, saveQuest]);

  const handleReset = useCallback(() => {
    stopGpsAndCleanup();
    setIsTracking(false);
    dispatchTracking({ type: "RESET" });
    accumulatedDistanceRef.current = 0;
    setShowCompletion(false);
    setCongratulation("");
    setSelectedLandmarkId(null);
    setCustomMarker(null);
    setQuestName(null);
    questNameRef.current = null;
  }, [stopGpsAndCleanup]);

  const applyManualCoords = useCallback(() => {
    const lat = parseFloat(manualLat.replace(",", "."));
    const lng = parseFloat(manualLng.replace(",", "."));
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      toast.error("Некорректные координаты. Широта: -90…90, Долгота: -180…180");
      return;
    }
    setManualCoords([lat, lng]);
    setShowManualInput(false);
    toast.success("Координаты установлены");
  }, [manualLat, manualLng]);

  return (
    <section className="relative">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-amber-900">
            Карта приключений
          </h2>
          <p className="text-sm text-muted-foreground">
            {isTracking
              ? "Следуйте к цели"
              : targetCoords
                ? "Цель выбрана"
                : "Выберите цель для вечерней прогулки"}
          </p>
        </div>
      </div>

      <div className="relative h-[55vh] min-h-[400px] w-full">
        <MapInner
          selectedLandmarkId={selectedLandmarkId}
          customMarker={customMarker}
          onSelectLandmark={handleSelectLandmark}
          onPlaceMarker={handlePlaceMarker}
          currentPosition={currentPosition}
          travelledPath={travelledPath}
          targetCoords={targetCoords}
          isTracking={isTracking}
          userLocation={startPosition}
          geoCoords={geo.coords ?? manualCoords}
        />
        <button
          onClick={locate}
          disabled={geo.loading}
          className={
            "absolute bottom-4 right-4 z-[1001] flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-lg transition-all hover:shadow-xl disabled:opacity-70 " +
            (geo.error && !geo.coords
              ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-amber-200/60 bg-white text-amber-700 hover:bg-amber-50")
          }
          title={
            geo.coords
              ? "Местоположение определено"
              : geo.error
                ? "Ошибка геолокации"
                : "Определить моё местоположение"
          }
        >
          {geo.loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          ) : geo.coords ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : geo.error ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Navigation className="h-4 w-4 text-amber-600" />
          )}
          <span className="hidden sm:inline">
            {geo.loading
              ? "Определяем..."
              : geo.coords
                ? "Местоположение определено"
                : geo.error
                  ? "Ошибка"
                  : "Определить"}
          </span>
        </button>

        {geo.error && !geo.coords && (
          <div className="absolute bottom-4 left-4 right-24 z-[1001] rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <span>{geo.error}</span>
            </div>
          </div>
        )}

        {!geo.coords && !isTracking && (
          <div className="absolute bottom-20 right-4 z-[1001] w-56 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {showManualInput ? (
              <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-800">
                    Ввод координат
                  </span>
                  <button
                    onClick={() => setShowManualInput(false)}
                    className="text-amber-400 hover:text-amber-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-amber-700">Широта</label>
                    <Input
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="55.7558"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-700">Долгота</label>
                    <Input
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="37.6173"
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    onClick={applyManualCoords}
                    size="sm"
                    className="w-full gap-1 bg-amber-600 text-xs text-white hover:bg-amber-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Применить
                  </Button>
                </div>
                {manualCoords && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ Установлены: {manualCoords[0].toFixed(4)},{" "}
                    {manualCoords[1].toFixed(4)}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full rounded-lg border border-amber-200/60 bg-white/90 px-3 py-2 text-xs font-medium text-amber-700 shadow-lg backdrop-blur-sm transition-all hover:bg-amber-50 hover:shadow-xl"
              >
                Ввести координаты вручную
              </button>
            )}
          </div>
        )}
      </div>

      {!isTracking && targetCoords && questName && !showCompletion && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-amber-200/60 bg-amber-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <ScrollText className="h-4 w-4 text-amber-600" />
                {questName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
                  <Crosshair className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Дистанция</p>
                    <p className="text-lg font-semibold text-amber-900">
                      {totalDistance !== null
                        ? totalDistance < 1
                          ? `${Math.round(totalDistance * 1000)} м`
                          : `${totalDistance.toFixed(1)} км`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
                  <Footprints className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Время в пути
                    </p>
                    <p className="text-lg font-semibold text-amber-900">
                      {estimatedTime !== null
                        ? estimatedTime < 60
                          ? `${estimatedTime} мин`
                          : `${Math.floor(estimatedTime / 60)} ч ${estimatedTime % 60} мин`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="px-4 pb-4">
              <Button
                onClick={handleStartQuest}
                className="w-full gap-2 bg-amber-600 text-white hover:bg-amber-700"
              >
                <Play className="size-4" />
                Начать путь
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isTracking && questName && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-amber-200/60 bg-amber-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <ScrollText className="h-4 w-4 text-amber-600" />
                {questName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Прогресс</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {Math.round(progressFraction * 100)}%
                </span>
              </div>
              <Progress value={progressFraction * 100} />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
                  <Footprints className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Пройдено</p>
                    <p className="text-lg font-semibold text-amber-900">
                      {distanceTraveled !== null
                        ? distanceTraveled < 1
                          ? `${Math.round(distanceTraveled * 1000)} м`
                          : `${distanceTraveled.toFixed(1)} км`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
                  <Target className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Осталось</p>
                    <p className="text-lg font-semibold text-amber-900">
                      {distanceRemaining !== null
                        ? distanceRemaining < 1
                          ? `${Math.round(distanceRemaining * 1000)} м`
                          : `${distanceRemaining.toFixed(1)} км`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
                  <Clock className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">Прошло</p>
                    <p className="text-lg font-semibold text-amber-900">
                      {elapsedMin > 0
                        ? `${elapsedMin} мин ${elapsedSec} сек`
                        : `${elapsedSec} сек`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-amber-100/60 px-4 py-3">
                  <Flag className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Осталось времени
                    </p>
                    <p className="text-lg font-semibold text-amber-900">
                      {timeRemaining !== null
                        ? timeRemaining < 60
                          ? `${timeRemaining} мин`
                          : `${Math.floor(timeRemaining / 60)} ч ${timeRemaining % 60} мин`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex gap-2 px-4 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopQuest}
                className="flex-1 gap-2 text-xs"
              >
                <Square className="size-3.5" />
                Остановить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1 gap-2 text-xs text-muted-foreground"
              >
                <X className="size-3.5" />
                Выбрать другую цель
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showCompletion &&
        questName &&
        totalDistance !== null &&
        congratulation && (
          <QuestCompletion
            questName={questName}
            distanceKm={completedDistanceKm}
            elapsedSeconds={completedElapsedSeconds}
            congratulation={congratulation}
            onNewQuest={handleNewQuest}
          />
        )}
    </section>
  );
}
