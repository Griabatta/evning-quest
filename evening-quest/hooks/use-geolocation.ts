"use client";

import { useState, useCallback, useRef } from "react";

interface GeolocationState {
  coords: [number, number] | null;
  loading: boolean;
  error: string | null;
  isWatching: boolean;
}

const GEO_ERROR_MESSAGES: Record<number, string> = {
  1: "Доступ к геолокации запрещён. Разрешите доступ в настройках браузера или введите координаты вручную.",
  2: "Не удалось определить местоположение. Сигнал GPS недоступен. Введите координаты вручную.",
  3: "Время ожидания геолокации истекло. Проверьте соединение или введите координаты вручную.",
};

function normalizeError(err: GeolocationPositionError): string {
  return GEO_ERROR_MESSAGES[err.code] ?? err.message;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
    isWatching: false,
  });
  const watchIdRef = useRef<number | null>(null);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        coords: null,
        loading: false,
        error:
          "Ваш браузер не поддерживает геолокацию. Введите координаты вручную.",
        isWatching: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: [position.coords.latitude, position.coords.longitude],
          loading: false,
          error: null,
          isWatching: false,
        });
      },
      (err) => {
        setState({
          coords: null,
          loading: false,
          error: normalizeError(err),
          isWatching: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const startWatching = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        coords: null,
        loading: false,
        error:
          "Ваш браузер не поддерживает геолокацию. Введите координаты вручную.",
        isWatching: false,
      });
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          coords: [position.coords.latitude, position.coords.longitude],
          loading: false,
          error: null,
          isWatching: true,
        });
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: normalizeError(err),
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isWatching: false }));
  }, []);

  return { ...state, locate, startWatching, stopWatching };
}
