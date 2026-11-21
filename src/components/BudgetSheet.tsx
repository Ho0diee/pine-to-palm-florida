import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Circle,
  Cloud,
  Copy,
  Lock,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import type { SyncState } from './TopBar';
import {
  AIRBNB_OPTIONS,
  ATTRACTIONS,
  CHECKLIST_ITEMS,
  FLIGHT_OPTIONS,
  RESTAURANTS,
  TIER_2_TARGET,
} from '../data/tripData';
import type { BudgetBreakdown, DepartureAirport, TripConfig } from '../types/trip';
import { formatMoney } from '../utils/budget';

interface BudgetSheetProps {
  open: boolean;
  initialTab: 'budget' | 'checklist';
  config: TripConfig;
  budget: BudgetBreakdown;
  syncState: SyncState;
  lastSyncedAt: string | null;
  cloudEnabled: boolean;
  onClose: () => void;
  onUpdateConfig: (updater: (prev: TripConfig) => TripConfig) => void;
  onReset: () => void;
  onRefreshCloud: () => void;
  onLockApp: () => void;
}

export function BudgetSheet({
  open,
  initialTab,
  config,
  budget,
  syncState,
  lastSyncedAt,
  cloudEnabled,
  onClose,
  onUpdateConfig,
  onReset,
  onRefreshCloud,
  onLockApp,
}: BudgetSheetProps) {
  const [sheetTab, setSheetTab] = useState<'budget' | 'checklist'>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) setSheetTab(initialTab);
  }, [open, initialTab]);

  if (!open) return null;

  const activeTab = sheetTab;
  const selectedAirbnb =
    AIRBNB_OPTIONS.find((a) => a.id === config.selectedAirbnbId) ?? AIRBNB_OPTIONS[0];
  const selectedFlight =
    FLIGHT_OPTIONS.find((f) => f.id === config.selectedFlightId) ?? FLIGHT_OPTIONS[0];

  const handleAirportChange = (airport: DepartureAirport) => {
    const matchingFlight = FLIGHT_OPTIONS.find((f) => f.from === airport && f.recommended) ??
      FLIGHT_OPTIONS.find((f) => f.from === airport);
    onUpdateConfig((prev) => ({
      ...prev,
      airport,
      selectedFlightId: matchingFlight ? matchingFlight.id : prev.selectedFlightId,
    }));
  };

  const toggleChecklist = (id: string) => {
    onUpdateConfig((prev) => ({
      ...prev,
      checkedChecklistIds: prev.checkedChecklistIds.includes(id)
        ? prev.checkedChecklistIds.filter((item) => item !== id)
        : [...prev.checkedChecklistIds, id],
    }));
  };

  const copySummary = async () => {
    const selectedEatNames = RESTAURANTS.filter(
      (r) => config.selectedRestaurantIds.includes(r.id) && r.recommendedDay <= config.days
    ).map((r) => `• ${r.name} (${r.area}) — ${r.signatureOrder}`);
    const selectedPlaceNames = ATTRACTIONS.filter(
      (a) => config.selectedAttractionIds.includes(a.id) && a.recommendedDay <= config.days
    ).map((a) => `• ${a.name} (${a.estCostPerPerson === 0 ? 'Free' : formatMoney(a.estCostPerPerson)})`);

    const summary = [
      `PINE TO PALM — TIER 2 MAINE TO FLORIDA TRIP`,
      `${config.airport} → ${selectedFlight.to} (${selectedFlight.airline}) · ${config.days} Days / ${config.days - 1} Nights · ${config.travelers} Traveler(s)`,
      `Season: ${config.season === 'peak' ? 'Peak Winter/Spring (Jan–Apr)' : 'Shoulder (May / Sept–Nov)'}`,
      ``,
      `ESTIMATED BUDGET: ${formatMoney(budget.totalPerPerson)}/person${
        config.travelers > 1 ? ` (${formatMoney(budget.groupTotal)} group total)` : ''
      }`,
      `- Flights: ${formatMoney(budget.flightsPerPerson)}/ea`,
      `- Local Transit (${config.transitMode}): ${formatMoney(budget.transitPerPerson)}/ea`,
      `- Airbnb (${selectedAirbnb.name}): ${formatMoney(budget.airbnbPerPerson)}/ea (${formatMoney(budget.airbnbTotal)} total)`,
      `- Food & Drinks: ${formatMoney(budget.foodPerPerson)}/ea`,
      `- Places to Go: ${formatMoney(budget.activitiesPerPerson + budget.customStopsPerPerson)}/ea`,
      ``,
      `LOCATIONS TO EAT:`,
      ...selectedEatNames,
      ``,
      `PLACES TO GO:`,
      ...selectedPlaceNames,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const total = Math.max(1, budget.totalPerPerson);
  const segments = [
    { label: 'Flights', value: budget.flightsPerPerson, color: 'bg-[#0F4C5C]' },
    { label: 'Airbnb', value: budget.airbnbPerPerson, color: 'bg-[#E06D53]' },
    { label: 'Food', value: budget.foodPerPerson, color: 'bg-[#2D6A4F]' },
    { label: 'Transit', value: budget.transitPerPerson, color: 'bg-[#3A86A8]' },
    {
      label: 'Places',
      value: budget.activitiesPerPerson + budget.customStopsPerPerson,
      color: 'bg-[#D9A05B]',
    },
  ];

  const gaugePct = Math.min(100, Math.max(6, ((budget.totalPerPerson - 1000) / 1800) * 100));
  const completedChecks = config.checkedChecklistIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A2426]/50 backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[430px] max-h-[88dvh] bg-[#FAF8F5] rounded-t-3xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
        {/* Handle + Header */}
        <div className="pt-2.5 pb-3 px-4 border-b border-[#E6E1D8] bg-white">
          <div className="w-10 h-1 rounded-full bg-[#D7D1C7] mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#1A2426]">
                Tier 2 Trip Control
              </h2>
              <p className="text-xs text-[#5C6B6E]">
                Live math from Maine takeoff to Gulf sunset
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F3EFE8] flex items-center justify-center text-[#1A2426] active:scale-95"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-3 p-1 bg-[#F2EEE7] rounded-xl">
            <button
              type="button"
              onClick={() => setSheetTab('budget')}
              className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'budget'
                  ? 'bg-white text-[#0F4C5C] shadow-xs'
                  : 'text-[#5C6B6E]'
              }`}
            >
              Budget & Settings
            </button>
            <button
              type="button"
              onClick={() => setSheetTab('checklist')}
              className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-white text-[#0F4C5C] shadow-xs'
                  : 'text-[#5C6B6E]'
              }`}
            >
              Checklist ({completedChecks}/{CHECKLIST_ITEMS.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 space-y-4 safe-pb">
          {activeTab === 'budget' ? (
            <>
              {/* Hero Budget Card */}
              <div className="rounded-2xl bg-[#0F4C5C] text-[#FAF8F5] p-4 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/70 font-medium">
                      Estimated Per Person
                    </p>
                    <p className="font-display text-3xl font-semibold tabular-nums mt-0.5">
                      {formatMoney(budget.totalPerPerson)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        budget.tierStatus === 'sweet-spot'
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : budget.tierStatus === 'under'
                            ? 'bg-sky-400/20 text-sky-200'
                            : 'bg-amber-400/25 text-amber-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {budget.tierStatus === 'sweet-spot'
                        ? 'In Tier 2 Sweet Spot'
                        : budget.tierStatus === 'under'
                          ? 'Below Tier 2 Target'
                          : 'Above Tier 2 Target'}
                    </span>
                    {config.travelers > 1 && (
                      <p className="text-[11px] text-white/75 mt-1 tabular-nums">
                        Group total: {formatMoney(budget.groupTotal)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tier 2 Range Gauge */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>$1,000</span>
                    <span className="font-semibold text-white">
                      Tier 2: {formatMoney(TIER_2_TARGET.min)}–{formatMoney(TIER_2_TARGET.max)}
                    </span>
                    <span>$2,800+</span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-400/35"
                      style={{ left: '36%', width: '42%' }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-2.5 rounded-full bg-[#F4A261] shadow ring-2 ring-white"
                      style={{ left: `calc(${gaugePct}% - 5px)` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Controls */}
              <div className="rounded-2xl bg-white border border-[#E6E1D8] p-3.5 space-y-3.5">
                {/* Departure Airport */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B6E] block mb-1.5">
                    Maine Departure Airport
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['PWM', 'BGR'] as const).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleAirportChange(code)}
                        className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                          config.airport === code
                            ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                            : 'bg-[#FAF8F5] text-[#1A2426] border-[#E6E1D8]'
                        }`}
                      >
                        {code === 'PWM' ? 'Portland (PWM)' : 'Bangor (BGR)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trip Days & Travelers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B6E] block mb-1.5">
                      Trip Length
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {([3, 4, 5] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({ ...prev, days: d }))
                          }
                          className={`h-10 rounded-xl border text-xs font-semibold ${
                            config.days === d
                              ? 'bg-[#E06D53] text-white border-[#E06D53]'
                              : 'bg-[#FAF8F5] text-[#1A2426] border-[#E6E1D8]'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B6E] flex items-center gap-1 mb-1.5">
                      <Users className="w-3 h-3" /> Travelers
                    </label>
                    <div className="h-10 rounded-xl border border-[#E6E1D8] bg-[#FAF8F5] flex items-center justify-between px-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            travelers: Math.max(1, prev.travelers - 1),
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-[#E6E1D8] flex items-center justify-center active:scale-95"
                        aria-label="Decrease travelers"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold tabular-nums">
                        {config.travelers}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            travelers: Math.min(4, prev.travelers + 1),
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-[#E6E1D8] flex items-center justify-center active:scale-95"
                        aria-label="Increase travelers"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {config.travelers > 1 && (
                  <p className="text-[11px] text-[#2D6A4F] bg-[#2D6A4F]/10 rounded-xl px-3 py-2 font-medium">
                    Splitting Airbnb & local transit across {config.travelers} travelers saves{' '}
                    <strong>
                      {formatMoney(
                        budget.airbnbTotal -
                          budget.airbnbPerPerson +
                          (budget.transitTotal - budget.transitPerPerson)
                      )}
                    </strong>{' '}
                    per person vs. going solo!
                  </p>
                )}

                {/* Season Toggle */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B6E] flex items-center gap-1 mb-1.5">
                    <Sun className="w-3 h-3" /> Travel Season
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, season: 'shoulder' }))
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        config.season === 'shoulder'
                          ? 'bg-[#0F4C5C]/10 border-[#0F4C5C] text-[#0F4C5C]'
                          : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#5C6B6E]'
                      }`}
                    >
                      <div className="text-xs font-bold">Shoulder (Best Value)</div>
                      <div className="text-[10.5px] opacity-80">May · Sept – Nov</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, season: 'peak' }))
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        config.season === 'peak'
                          ? 'bg-[#E06D53]/12 border-[#E06D53] text-[#B84A32]'
                          : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#5C6B6E]'
                      }`}
                    >
                      <div className="text-xs font-bold">Peak Winter (+30%)</div>
                      <div className="text-[10.5px] opacity-80">Jan – Apr Snowbird</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stacked Bar + Itemized Breakdown */}
              <div className="rounded-2xl bg-white border border-[#E6E1D8] p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6B6E] mb-2.5">
                  Per-Person Cost Breakdown
                </h3>
                <div className="h-3 rounded-full overflow-hidden flex gap-0.5 mb-3.5 bg-[#F2EEE7]">
                  {segments.map((seg) => (
                    <div
                      key={seg.label}
                      className={`${seg.color} h-full transition-all duration-300`}
                      style={{ width: `${(seg.value / total) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="space-y-2.5">
                  {segments.map((seg) => (
                    <div
                      key={seg.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                        <span className="text-[#1A2426] font-medium">
                          {seg.label}
                        </span>
                      </div>
                      <span className="font-bold text-[#1A2426] tabular-nums">
                        {formatMoney(seg.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copySummary}
                  className="flex-1 h-11 rounded-xl bg-[#0F4C5C] text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Trip Plan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="h-11 px-3.5 rounded-xl bg-white border border-[#E6E1D8] text-[#5C6B6E] font-semibold text-xs flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Cloud Sync & App Lock Card */}
              <div className="rounded-2xl bg-white border border-[#E6E1D8] p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1A2426] flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    {syncState === 'saving'
                      ? 'Saving to cloud…'
                      : syncState === 'synced'
                        ? 'Universal Cloud Sync Active'
                        : syncState === 'local'
                          ? 'Local Preview Mode'
                          : 'Cloud Sync Warning'}
                  </div>
                  <p className="text-[11px] text-[#6B7A7D] truncate mt-0.5">
                    {lastSyncedAt
                      ? `Last saved ${new Date(lastSyncedAt).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}`
                      : 'Changes sync across all devices automatically'}
                  </p>
                </div>

                {cloudEnabled && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={onRefreshCloud}
                      className="h-9 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-[#0F4C5C] text-xs font-semibold flex items-center gap-1 active:scale-95"
                      title="Pull latest saved plan from cloud"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={onLockApp}
                      className="h-9 px-2.5 rounded-xl bg-[#E06D53]/12 text-[#B84A32] text-xs font-semibold flex items-center gap-1 active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5" /> Lock
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Checklist View */}
              {(['Book Ahead', 'Maine Departure', 'Florida Packing'] as const).map(
                (section) => {
                  const items = CHECKLIST_ITEMS.filter((i) => i.section === section);
                  return (
                    <div
                      key={section}
                      className="rounded-2xl bg-white border border-[#E6E1D8] p-3.5"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C] mb-2.5">
                        {section}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const checked = config.checkedChecklistIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleChecklist(item.id)}
                              className="w-full flex items-start gap-2.5 text-left py-1 active:opacity-70"
                            >
                              {checked ? (
                                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-5 h-5 text-[#C5BEB2] shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-[13px] leading-snug ${
                                    checked
                                      ? 'line-through text-[#8D989A]'
                                      : 'text-[#1A2426] font-medium'
                                  }`}
                                >
                                  {item.text}
                                </p>
                                {item.timing && (
                                  <span className="text-[10.5px] text-[#7D8A8D]">
                                    {item.timing}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
