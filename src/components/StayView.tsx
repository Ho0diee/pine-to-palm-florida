import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Home,
  MapPin,
  Plane,
  Star,
  Umbrella,
} from 'lucide-react';
import { AIRBNB_OPTIONS } from '../data/tripData';
import type { BudgetBreakdown, TripConfig } from '../types/trip';
import { formatMoney } from '../utils/budget';

interface StayViewProps {
  config: TripConfig;
  budget: BudgetBreakdown;
  onUpdateConfig: (updater: (prev: TripConfig) => TripConfig) => void;
}

export function StayView({ config, budget, onUpdateConfig }: StayViewProps) {
  const [expandedFeeId, setExpandedFeeId] = useState<string | null>(
    config.selectedAirbnbId
  );

  const nights = Math.max(1, config.days - 1);
  const seasonMult = config.season === 'peak' ? 1.32 : 1.0;

  const selectAirbnb = (id: string) => {
    onUpdateConfig((prev) => ({ ...prev, selectedAirbnbId: id }));
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header Summary Card */}
      <section className="rounded-3xl bg-white border border-[#E6E1D8] p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C8533A]">
              <Home className="w-3.5 h-3.5" /> Curated Tier 2 Airbnbs
            </div>
            <h2 className="font-display text-xl font-semibold text-[#1A2426] mt-0.5">
              Pick Your Home Base ({nights} Nights)
            </h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-[#0F4C5C] tabular-nums">
              {formatMoney(budget.airbnbPerPerson)}
            </div>
            <div className="text-[10.5px] text-[#6B7A7D]">
              {config.travelers > 1 ? 'your share' : 'all-in total'}
            </div>
          </div>
        </div>
        <p className="text-xs text-[#5C6B6E] mt-1.5 leading-relaxed">
          Every stay below includes estimated cleaning fees, Airbnb service fees, and 13% Florida transient taxes—no checkout shocks.
        </p>
      </section>

      {/* Airbnb Cards */}
      <div className="space-y-4">
        {AIRBNB_OPTIONS.map((stay) => {
          const isSelected = config.selectedAirbnbId === stay.id;
          const nightlyAdjusted = Math.round(stay.nightlyBase * seasonMult);
          const roomSubtotal = nightlyAdjusted * nights;
          const preTax = roomSubtotal + stay.cleaningFee;
          const feesAndTax = Math.round(preTax * stay.serviceAndTaxRate);
          const allInTotal = preTax + feesAndTax;
          const allInPerNight = Math.round(allInTotal / nights);
          const perPerson = Math.round(allInTotal / config.travelers);
          const feeOpen = expandedFeeId === stay.id;

          return (
            <article
              key={stay.id}
              className={`rounded-3xl bg-white overflow-hidden border transition-all ${
                isSelected
                  ? 'border-[#0F4C5C] ring-2 ring-[#0F4C5C]/15 shadow-md'
                  : 'border-[#E6E1D8] shadow-xs'
              }`}
            >
              {/* Photo Header */}
              <div className="relative">
                <img
                  src={stay.image}
                  alt={stay.name}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  {stay.badge ? (
                    <span className="px-2.5 py-1 rounded-full bg-white/92 text-[#1A2426] text-[11px] font-bold shadow-xs">
                      {stay.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="px-2 py-1 rounded-full bg-black/55 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#F4B942] text-[#F4B942]" />
                    {stay.rating} ({stay.reviews})
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[11px] font-semibold text-white/85 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {stay.neighborhood} · {stay.city}
                    </span>
                    <h3 className="font-display text-lg font-semibold leading-tight mt-0.5">
                      {stay.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#0F4C5C] bg-[#0F4C5C]/8 px-2.5 py-1 rounded-lg">
                    {stay.vibe}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#1A2426] tabular-nums">
                      {formatMoney(allInPerNight)}/night
                    </span>
                    <span className="text-[11px] text-[#6B7A7D] block">
                      {formatMoney(perPerson)} {config.travelers > 1 ? '/ person' : 'total'} ({nights}n)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#4C5B5E] leading-relaxed">
                  {stay.description}
                </p>

                {/* Distance Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] px-2.5 py-2 flex items-center gap-1.5 text-[#1A2426]">
                    <Umbrella className="w-3.5 h-3.5 text-[#E06D53] shrink-0" />
                    <span className="truncate">{stay.distanceToBeach}</span>
                  </div>
                  <div className="rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] px-2.5 py-2 flex items-center gap-1.5 text-[#1A2426]">
                    <Plane className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0" />
                    <span className="truncate">{stay.distanceToAirport}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5">
                  {stay.highlights.map((item) => (
                    <span
                      key={item}
                      className="text-[10.5px] px-2 py-0.5 rounded-md bg-[#F2EEE7] text-[#3F4D50] font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Expandable Fee Transparency */}
                <div className="rounded-xl border border-[#ECE7DF] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedFeeId(feeOpen ? null : stay.id)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] flex items-center justify-between text-[11.5px] font-semibold text-[#455356]"
                  >
                    <span>
                      See exact {nights}-night Airbnb fee breakdown
                    </span>
                    {feeOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {feeOpen && (
                    <div className="p-3 bg-white space-y-1.5 text-xs border-t border-[#ECE7DF]">
                      <div className="flex justify-between text-[#5C6B6E]">
                        <span>
                          {formatMoney(nightlyAdjusted)} × {nights} nights
                          {config.season === 'peak' ? ' (peak)' : ''}
                        </span>
                        <span className="tabular-nums font-medium text-[#1A2426]">
                          {formatMoney(roomSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#5C6B6E]">
                        <span>Cleaning fee</span>
                        <span className="tabular-nums font-medium text-[#1A2426]">
                          {formatMoney(stay.cleaningFee)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#5C6B6E]">
                        <span>Airbnb service + FL taxes</span>
                        <span className="tabular-nums font-medium text-[#1A2426]">
                          {formatMoney(feesAndTax)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-[#ECE7DF] font-bold text-[#1A2426]">
                        <span>All-In Stay Total</span>
                        <span className="tabular-nums">{formatMoney(allInTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Select CTA */}
                <button
                  type="button"
                  onClick={() => selectAirbnb(stay.id)}
                  className={`w-full h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-[#0F4C5C] text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" /> Selected as Your Stay
                    </>
                  ) : (
                    `Select Stay (${formatMoney(perPerson)}/ea)`
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
