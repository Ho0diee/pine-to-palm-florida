import { useState } from 'react';
import {
  Check,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { RESTAURANTS } from '../data/tripData';
import type {
  AreaTag,
  BudgetBreakdown,
  MealCategory,
  TripConfig,
} from '../types/trip';
import { formatMoney } from '../utils/budget';

interface EatViewProps {
  config: TripConfig;
  budget: BudgetBreakdown;
  onUpdateConfig: (updater: (prev: TripConfig) => TripConfig) => void;
}

const MEAL_FILTERS: ('All' | MealCategory)[] = [
  'All',
  'Coffee & Breakfast',
  'Lunch',
  'Dinner',
  'Drinks & Dessert',
];

const AREA_FILTERS: ('All Areas' | AreaTag)[] = [
  'All Areas',
  'St. Pete',
  'Tampa & Ybor',
  'Gulf Beaches',
];

export function EatView({ config, budget, onUpdateConfig }: EatViewProps) {
  const [mealFilter, setMealFilter] = useState<'All' | MealCategory>('All');
  const [areaFilter, setAreaFilter] = useState<'All Areas' | AreaTag>('All Areas');

  const toggleRestaurant = (id: string) => {
    onUpdateConfig((prev) => ({
      ...prev,
      selectedRestaurantIds: prev.selectedRestaurantIds.includes(id)
        ? prev.selectedRestaurantIds.filter((r) => r !== id)
        : [...prev.selectedRestaurantIds, id],
    }));
  };

  const filtered = RESTAURANTS.filter((r) => {
    const matchMeal = mealFilter === 'All' || r.category === mealFilter;
    const matchArea = areaFilter === 'All Areas' || r.area === areaFilter;
    return matchMeal && matchArea;
  });

  const activeCount = RESTAURANTS.filter(
    (r) =>
      config.selectedRestaurantIds.includes(r.id) &&
      r.recommendedDay <= config.days
  ).length;

  return (
    <div className="space-y-4 pb-6">
      {/* Food Hero Card */}
      <section className="relative rounded-3xl overflow-hidden border border-[#E6E1D8] shadow-sm">
        <img
          src="/images/dining-spread.jpg"
          alt="Tampa Bay seafood, Cuban sandwiches, and key lime pie"
          className="w-full h-36 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2426]/92 via-[#1A2426]/45 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#F4B99B]">
              <Utensils className="w-3 h-3" /> Locations to Eat
            </div>
            <h2 className="font-display text-xl font-semibold leading-tight mt-0.5">
              Cuban Bread, Grouper & Rooftops
            </h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold tabular-nums">
              {formatMoney(budget.foodPerPerson)}
            </div>
            <div className="text-[10px] text-white/80">
              {activeCount} spots + snacks
            </div>
          </div>
        </div>
      </section>

      {/* Meal Type Filter Chips */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
          {MEAL_FILTERS.map((cat) => {
            const active = mealFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setMealFilter(cat)}
                className={`shrink-0 h-9 px-3.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                  active
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                    : 'bg-white text-[#455356] border-[#E6E1D8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Area Filter Row */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
          {AREA_FILTERS.map((area) => {
            const active = areaFilter === area;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setAreaFilter(area)}
                className={`shrink-0 h-7 px-3 rounded-full text-[11px] font-semibold transition-all ${
                  active
                    ? 'bg-[#E06D53]/15 text-[#B84A32]'
                    : 'bg-[#F2EEE7] text-[#5C6B6E]'
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-3">
        {filtered.map((spot) => {
          const isSelected = config.selectedRestaurantIds.includes(spot.id);
          const outsideTripDays = spot.recommendedDay > config.days;

          return (
            <article
              key={spot.id}
              className={`rounded-2xl bg-white border p-3.5 transition-all ${
                isSelected
                  ? 'border-[#2D6A4F]/45 shadow-xs'
                  : 'border-[#E6E1D8]'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE7DF] text-[#0F4C5C]">
                      {spot.category}
                    </span>
                    <span className="text-[11px] text-[#5C6B6E] flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" /> {spot.area}
                    </span>
                  </div>
                  <h3 className="font-display text-[16px] font-semibold text-[#1A2426] leading-snug mt-1">
                    {spot.name}
                  </h3>
                  <p className="text-[11.5px] text-[#6B7A7D]">
                    {spot.cuisine} · {spot.priceLevel} · Day {spot.recommendedDay}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#1A2426] tabular-nums">
                    ~{formatMoney(spot.estCostPerPerson)}
                  </div>
                  <div className="text-[10px] text-[#6B7A7D]">per person</div>
                </div>
              </div>

              <p className="text-xs text-[#455356] mt-2 leading-relaxed">
                {spot.whyGo}
              </p>

              {/* Signature Order Callout */}
              <div className="mt-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C8533A] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> What to Order
                </div>
                <p className="text-xs font-semibold text-[#1A2426] mt-0.5">
                  {spot.signatureOrder}
                </p>
              </div>

              {/* Footer Tip + Toggle Button */}
              <div className="mt-3 pt-2.5 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#5C6B6E] flex items-center gap-1 min-w-0">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-[#0F4C5C]" />
                  <span className="truncate">{spot.reservationTip}</span>
                </span>

                <button
                  type="button"
                  onClick={() => toggleRestaurant(spot.id)}
                  className={`shrink-0 h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-[#F2EEE7] text-[#1A2426]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> In Plan
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </>
                  )}
                </button>
              </div>

              {outsideTripDays && isSelected && (
                <p className="text-[10.5px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1 mt-2">
                  Suggested for Day {spot.recommendedDay} — increase trip length in Budget panel or swap into Days 1–{config.days}.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
