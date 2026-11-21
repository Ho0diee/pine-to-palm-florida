import {
  ChevronDown,
  Cloud,
  CloudOff,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import type { BudgetBreakdown, TripConfig } from '../types/trip';
import { formatMoney } from '../utils/budget';

export type SyncState = 'synced' | 'saving' | 'loading' | 'local' | 'error';

interface TopBarProps {
  config: TripConfig;
  budget: BudgetBreakdown;
  syncState: SyncState;
  onOpenBudget: (initialTab?: 'budget' | 'checklist') => void;
}

export function TopBar({
  config,
  budget,
  syncState,
  onOpenBudget,
}: TopBarProps) {
  const statusDot =
    budget.tierStatus === 'sweet-spot'
      ? 'bg-emerald-500'
      : budget.tierStatus === 'under'
        ? 'bg-sky-500'
        : 'bg-amber-500';

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8] px-3.5 py-2.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src="/icon-192.png"
          alt="Pine to Palm logo"
          className="w-8 h-8 rounded-xl shrink-0 shadow-xs object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-[15px] font-semibold leading-none text-[#1A2426] whitespace-nowrap">
              Pine to Palm
            </h1>
            <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#E06D53]/12 text-[#C8533A] whitespace-nowrap shrink-0">
              Tier 2
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C6B6E] mt-0.5">
            <span className="truncate">
              {config.airport} → FL · {config.days}d ·{' '}
              {config.travelers === 1 ? 'Solo' : `${config.travelers} ppl`}
            </span>
            <span
              className="inline-flex items-center shrink-0"
              title={
                syncState === 'synced'
                  ? 'Saved universally in cloud'
                  : syncState === 'saving'
                    ? 'Saving to cloud...'
                    : syncState === 'local'
                      ? 'Local preview mode'
                      : 'Sync issue'
              }
            >
              {syncState === 'saving' || syncState === 'loading' ? (
                <Loader2 className="w-3 h-3 text-[#0F4C5C] animate-spin" />
              ) : syncState === 'synced' ? (
                <Cloud className="w-3 h-3 text-[#2D6A4F]" />
              ) : (
                <CloudOff className="w-3 h-3 text-[#B84A32]" />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onOpenBudget('budget')}
          className="h-9 px-2.5 rounded-full bg-white border border-[#E2DCD2] shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
          aria-label="Open Tier 2 budget and trip settings"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
          <span className="text-xs font-bold text-[#1A2426] tabular-nums">
            {formatMoney(budget.totalPerPerson)}
          </span>
          <span className="text-[10px] text-[#6B7A7D]">/ea</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B7A7D]" />
        </button>

        <button
          type="button"
          onClick={() => onOpenBudget('checklist')}
          className="w-9 h-9 rounded-full bg-white border border-[#E2DCD2] shadow-xs flex items-center justify-center text-[#0F4C5C] active:scale-95 transition-transform shrink-0"
          aria-label="Trip settings and packing checklist"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
