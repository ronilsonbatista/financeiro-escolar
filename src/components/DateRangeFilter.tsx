import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangeFilterProps {
  currentMonthName: string;
  isClosed: boolean;
  onReset: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export default function DateRangeFilter({
  currentMonthName = 'Julho/2026',
  isClosed = false,
  onReset,
  onPrevMonth,
  onNextMonth,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-4 font-sans select-none">
      {/* Date selector button pill matching the print */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E6E1D6] bg-slate-50 hover:bg-[#F8F7F2] text-xs text-slate-900 font-black uppercase tracking-wider shadow-2xs transition-colors cursor-pointer"
      >
        <Calendar className="w-4 h-4 text-brand-accent" />
        <span>Filtro &middot; 01/07 &rarr; 31/07</span>
      </button>

      {/* "Mês atual" Link trigger */}
      <button
        onClick={onReset}
        className="text-slate-500 hover:text-slate-900 font-bold text-xs underline decoration-dotted underline-offset-4 cursor-pointer transition-colors"
      >
        Mês atual
      </button>
    </div>
  );
}
