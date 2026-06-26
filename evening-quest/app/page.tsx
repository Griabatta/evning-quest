import { MapView } from "@/components/map-view";
import { Compass, ScrollText } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-9rem)]">
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-background pb-8 pt-12">
        <div className="absolute inset-0 pattern-grid opacity-[0.03]" />
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Compass className="h-7 w-7 text-amber-700" />
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-amber-900 sm:text-5xl">
              Evening Quest
            </h1>
            <p className="text-lg text-muted-foreground">
              Превратите вечернюю прогулку в маленькое приключение. Выберите
              цель на карте и отправляйтесь в путь.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <MapView />
      </section>

      <section className="border-t border-amber-100 bg-amber-50/30">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ScrollText className="h-5 w-5" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-amber-900">
              Как это работает
            </h2>
            <p className="text-sm text-muted-foreground">
              Выберите одну из достопримечательностей на карте или поставьте
              произвольную метку — и квест начнётся. Приложение будет
              отслеживать ваш прогресс и вести к цели.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
