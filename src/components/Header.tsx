import React from "react";
import Image from "next/image";
import { CalendarCheck2 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-28 sm:w-32 flex items-center">
            <Image
              src="/images/logo.png"
              alt="DocGuía"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hidden sm:inline-block">
            Citas
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-900 bg-purple-50/80 border border-purple-200/60 px-3 py-1 rounded-full shadow-xs">
          <CalendarCheck2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Slots 20 min</span>
        </div>
      </div>
    </header>
  );
}
