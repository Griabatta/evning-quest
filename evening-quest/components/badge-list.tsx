"use client";

import {
  Footprints,
  Compass,
  MapPin,
  Trophy,
  Globe,
  Zap,
  CalendarDays,
  Star,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SerializableBadge } from "@/lib/badges";

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  Compass,
  MapPin,
  Trophy,
  Globe,
  Zap,
  CalendarDays,
  Star,
  Moon,
};

interface BadgeListProps {
  badges: SerializableBadge[];
}

export function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100">
          <Trophy className="h-7 w-7 text-amber-400" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          Нет доступных бейджей
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
      {badges.map((badge) => {
        const Icon = iconMap[badge.iconName] ?? Trophy;

        return (
          <Card
            key={badge.id}
            className={`border ${
              badge.awarded
                ? "border-amber-300 bg-amber-50/60"
                : "border-muted bg-muted/20 opacity-60"
            } animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  badge.awarded
                    ? "bg-amber-100 text-amber-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`truncate text-sm font-semibold ${
                      badge.awarded ? "text-amber-900" : "text-muted-foreground"
                    }`}
                  >
                    {badge.name}
                  </p>
                  {badge.awarded && (
                    <span className="shrink-0 text-xs text-amber-600">✓</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
