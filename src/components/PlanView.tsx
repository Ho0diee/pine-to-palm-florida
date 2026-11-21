import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Compass,
  Home,
  Lightbulb,
  Plane,
  Plus,
  SlidersHorizontal,
  Sun,
  Trash2,
  Utensils,
} from 'lucide-react';
import {
  AIRBNB_OPTIONS,
  ATTRACTIONS,
  BASE_ITINERARY,
  FLIGHT_OPTIONS,
  RESTAURANTS,
} from '../data/tripData';
import type {
  BudgetBreakdown,
  CustomStop,
  ItineraryStop,
  TabId,
  TripConfig,
} from '../types/trip';
import { formatMoney } from '../utils/budget';

interface PlanViewProps {
  config: TripConfig;
  budget: BudgetBreakdown;
  onUpdateConfig: (updater: (prev: TripConfig) => TripConfig) => void;
  onNavigateTab: (tab: TabId) => void;
  onOpenBudget: () => void;
}

const DAY_THEMES: Record<number, { short: string; title: string }> = {
  1: { short: 'Arrival', title: 'Maine Takeoff → Pier Sunset' },
  2: { short: 'Beaches', title: 'Gulf Sand & Catamaran Sail' },
  3: { short: 'St. Pete', title: 'Dalí, Murals & Rooftop Views' },
  4: { short: 'Tampa', title: 'Ybor City, Aquarium & Paella' },
  5: { short: 'Return', title: 'Brunch, Gardens & Home to ME' },
};

const KIND_STYLES: Record<
  ItineraryStop['kind'],
  { label: string; bg: string; text: string; icon: typeof Plane }
> = {
  travel: { label: 'Transit', bg: 'bg-[#0F4C5C]/10', text: 'text-[#0F4C5C]', icon: Plane },
  stay: { label: 'Airbnb', bg: 'bg-[#E06D53]/12', text: 'text-[#C8533A]', icon: Home },
  food: { label: 'Eat', bg: 'bg-[#2D6A4F]/12', text: 'text-[#2D6A4F]', icon: Utensils },
  activity: { label: 'Place to Go', bg: 'bg-[#D9A05B]/18', text: 'text-[#9A6721]', icon: Compass },
  relax: { label: 'Unwind', bg: 'bg-[#3A86A8]/12', text: 'text-[#256480]', icon: Sun },
};

export function PlanView({
  config,
  budget,
  onUpdateConfig,
  onNavigateTab,
  onOpenBudget,
}: PlanViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState('4:00 PM');
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newCost, setNewCost] = useState('');

  const activeDay = Math.min(selectedDay, config.days);
  const selectedAirbnb =
    AIRBNB_OPTIONS.find((a) => a.id === config.selectedAirbnbId) ?? AIRBNB_OPTIONS[0];
  const selectedFlight =
    FLIGHT_OPTIONS.find((f) => f.id === config.selectedFlightId) ?? FLIGHT_OPTIONS[0];

  // Build day stops dynamically, respecting chosen day count & linked selections
  const dayStops = BASE_ITINERARY.filter((stop) => {
    // On a 3-day or 4-day trip, pull the departure stop into the final day!
    if (stop.id === 'd5-return' && config.days < 5) {
      return activeDay === config.days;
    }
    return stop.day === activeDay;
  });

  const dayCustomStops = config.customStops.filter((s) => s.day === activeDay);

  const toggleComplete = (id: string) => {
    onUpdateConfig((prev) => ({
      ...prev,
      completedStopIds: prev.completedStopIds.includes(id)
        ? prev.completedStopIds.filter((s) => s !== id)
        : [...prev.completedStopIds, id],
    }));
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const stop: CustomStop = {
      id: `custom-${Date.now()}`,
      day: activeDay,
      time: newTime.trim() || 'Anytime',
      title: newTitle.trim(),
      note: newNote.trim() || 'Custom Tier 2 stop',
      cost: Math.max(0, Number(newCost) || 0),
    };
    onUpdateConfig((prev) => ({
      ...prev,
      customStops: [...prev.customStops, stop],
    }));
    setNewTitle('');
    setNewNote('');
    setNewCost('');
    setShowAddForm(false);
  };

  const deleteCustomStop = (id: string) => {
    onUpdateConfig((prev) => ({
      ...prev,
      customStops: prev.customStops.filter((s) => s.id !== id),
    }));
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Editorial Hero Card */}
      <section className="relative rounded-3xl overflow-hidden shadow-md border border-[#E6E1D8]">
        <img
          src="/images/hero-sunset.jpg"
          alt="Tampa Bay and St. Pete Gulf Coast at golden hour"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D2E38]/95 via-[#0D2E38]/45 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
            {config.airport} → {selectedFlight.to} · {selectedFlight.duration}
          </span>
          <button
            type="button"
            onClick={onOpenBudget}
            className="px-2.5 py-1 rounded-full bg-white/90 text-[#0F4C5C] text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95"
          >
            <SlidersHorizontal className="w-3 h-3" /> Tune Trip
          </button>
        </div>

        <div className="absolute bottom-3.5 left-4 right-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#F4B99B] font-semibold">
            Tampa Bay · St. Pete · Gulf Beaches
          </p>
          <h2 className="font-display text-[22px] font-semibold leading-tight mt-0.5">
            Your Complete Tier 2 Escape
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-xs">
              {config.days} Days / {config.days - 1} Nights
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-xs">
              {formatMoney(budget.totalPerPerson)}/person
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-xs truncate max-w-[175px]">
              {selectedAirbnb.city} Airbnb
            </span>
          </div>
        </div>
      </section>

      {/* Quick Jump Summary Strip */}
      <section className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onNavigateTab('trip')}
          className="rounded-2xl bg-white border border-[#E6E1D8] p-2.5 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0F4C5C] block">
            Trip Down
          </span>
          <span className="text-sm font-bold text-[#1A2426] block mt-0.5 tabular-nums">
            {formatMoney(budget.flightsPerPerson + budget.transitPerPerson)}
          </span>
          <span className="text-[10.5px] text-[#6B7A7D] truncate block">
            {selectedFlight.airline.split(' ')[0]} + {config.transitMode === 'rental' ? 'Car' : 'Uber'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('stay')}
          className="rounded-2xl bg-white border border-[#E6E1D8] p-2.5 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8533A] block">
            Airbnb ({config.days - 1}n)
          </span>
          <span className="text-sm font-bold text-[#1A2426] block mt-0.5 tabular-nums">
            {formatMoney(budget.airbnbPerPerson)}
          </span>
          <span className="text-[10.5px] text-[#6B7A7D] truncate block">
            {selectedAirbnb.city}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('eat')}
          className="rounded-2xl bg-white border border-[#E6E1D8] p-2.5 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2D6A4F] block">
            Food & Go
          </span>
          <span className="text-sm font-bold text-[#1A2426] block mt-0.5 tabular-nums">
            {formatMoney(budget.foodPerPerson + budget.activitiesPerPerson)}
          </span>
          <span className="text-[10.5px] text-[#6B7A7D] truncate block">
            {config.selectedRestaurantIds.length} eats · {config.selectedAttractionIds.length} spots
          </span>
        </button>
      </section>

      {/* Day-by-Day Horizontal Selector */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-semibold text-[#1A2426]">
            Day-by-Day Flow
          </h3>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs font-semibold text-[#0F4C5C] bg-[#0F4C5C]/10 px-2.5 py-1.5 rounded-full flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stop
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {Array.from({ length: config.days }, (_, idx) => idx + 1).map((dayNum) => {
            const isActive = activeDay === dayNum;
            const theme = DAY_THEMES[dayNum] ?? { short: `Day ${dayNum}`, title: '' };
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                className={`shrink-0 px-3.5 py-2 rounded-2xl border text-left transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-sm'
                    : 'bg-white text-[#1A2426] border-[#E6E1D8]'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-75 font-semibold">
                  Day {dayNum}
                </div>
                <div className="text-xs font-bold leading-tight mt-0.5">
                  {theme.short}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-semibold text-[#5C6B6E] mt-2.5 mb-3">
          Day {activeDay}: {DAY_THEMES[activeDay]?.title}
        </p>

        {/* Inline Add Custom Stop Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddStop}
            className="mb-3 rounded-2xl bg-white border border-[#0F4C5C]/30 p-3.5 shadow-sm space-y-2.5"
          >
            <div className="text-xs font-bold text-[#0F4C5C]">
              Add Custom Stop to Day {activeDay}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="4:00 PM"
                className="h-10 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs"
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Stop name (e.g. Pier Tiki Bar)"
                className="col-span-2 h-10 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Short note"
                className="col-span-2 h-10 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs"
              />
              <input
                type="number"
                min="0"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="$ Cost"
                className="h-10 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="h-9 px-3 rounded-xl text-xs font-semibold text-[#5C6B6E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-xl bg-[#0F4C5C] text-white text-xs font-semibold"
              >
                Save Stop
              </button>
            </div>
          </form>
        )}

        {/* Vertical Timeline Cards */}
        <div className="space-y-2.5">
          {dayStops.map((stop) => {
            const meta = KIND_STYLES[stop.kind];
            const Icon = meta.icon;
            const done = config.completedStopIds.includes(stop.id);
            const linkedEat = stop.linkedRestaurantId
              ? RESTAURANTS.find((r) => r.id === stop.linkedRestaurantId)
              : undefined;
            const linkedGo = stop.linkedAttractionId
              ? ATTRACTIONS.find((a) => a.id === stop.linkedAttractionId)
              : undefined;

            const isLinkedIncluded = linkedEat
              ? config.selectedRestaurantIds.includes(linkedEat.id)
              : linkedGo
                ? config.selectedAttractionIds.includes(linkedGo.id)
                : true;

            const displayTitle =
              stop.id === 'd1-checkin'
                ? `Check In: ${selectedAirbnb.name}`
                : stop.id === 'd1-depart'
                  ? `Depart ${config.airport} (${selectedFlight.airline})`
                  : stop.title;

            const displayTime =
              stop.id === 'd1-depart'
                ? selectedFlight.departTime
                : stop.id === 'd1-land'
                  ? selectedFlight.arriveTime
                  : stop.id === 'd5-return'
                    ? selectedFlight.returnDepart
                    : stop.time;

            const priceTag = linkedEat
              ? `~${formatMoney(linkedEat.estCostPerPerson)}/ea`
              : linkedGo
                ? linkedGo.estCostPerPerson === 0
                  ? 'Free'
                  : `${formatMoney(linkedGo.estCostPerPerson)}/ea`
                : stop.costLabel;

            return (
              <div
                key={stop.id}
                className={`rounded-2xl bg-white border p-3.5 transition-all ${
                  done
                    ? 'border-[#2D6A4F]/35 bg-[#F6FAF7]'
                    : !isLinkedIncluded
                      ? 'border-dashed border-[#D7D1C7] opacity-65'
                      : 'border-[#E6E1D8] shadow-[0_1px_2px_rgba(15,76,92,0.04)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleComplete(stop.id)}
                    className="mt-0.5 shrink-0 active:scale-90 transition-transform"
                    aria-label={done ? 'Mark stop incomplete' : 'Mark stop completed'}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#C8C1B6]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-[#0F4C5C] tabular-nums">
                          {displayTime}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {meta.label}
                        </span>
                      </div>
                      {priceTag && (
                        <span className="text-[11px] font-bold text-[#1A2426] shrink-0 tabular-nums">
                          {priceTag}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-[14px] font-bold leading-snug ${
                        done ? 'line-through text-[#7B888B]' : 'text-[#1A2426]'
                      }`}
                    >
                      {displayTitle}
                    </h4>
                    <p className="text-xs text-[#5C6B6E] mt-0.5 leading-relaxed">
                      {stop.subtitle}
                    </p>

                    {!isLinkedIncluded && (
                      <p className="text-[11px] text-[#B84A32] font-medium mt-1.5">
                        Removed from your active plan — re-enable in{' '}
                        {linkedEat ? 'Eat' : 'Go & Map'} tab.
                      </p>
                    )}

                    {(stop.tip || linkedEat?.signatureOrder || linkedGo?.insiderTip) && (
                      <div className="mt-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] px-2.5 py-2 flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-[#D9822B] shrink-0 mt-0.5" />
                        <p className="text-[11.5px] text-[#455356] leading-snug">
                          {linkedEat
                            ? `Order: ${linkedEat.signatureOrder}`
                            : linkedGo
                              ? linkedGo.insiderTip
                              : stop.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {dayCustomStops.map((custom) => (
            <div
              key={custom.id}
              className="rounded-2xl bg-white border border-[#0F4C5C]/25 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-[#0F4C5C]">
                      {custom.time}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C]">
                      Custom
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-[#1A2426]">
                    {custom.title}
                  </h4>
                  <p className="text-xs text-[#5C6B6E] mt-0.5">{custom.note}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {custom.cost > 0 && (
                    <span className="text-xs font-bold tabular-nums">
                      {formatMoney(custom.cost)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteCustomStop(custom.id)}
                    className="w-8 h-8 rounded-lg bg-[#FAF8F5] text-[#B84A32] flex items-center justify-center"
                    aria-label="Remove custom stop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
