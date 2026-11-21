import {
  ArrowRight,
  Car,
  Check,
  Clock,
  Info,
  Luggage,
  PlaneLanding,
  PlaneTakeoff,
  Sparkles,
} from 'lucide-react';
import {
  FLIGHT_OPTIONS,
  TRANSIT_OPTIONS,
  TRAVEL_DAY_STEPS,
} from '../data/tripData';
import type {
  BudgetBreakdown,
  DepartureAirport,
  TransitMode,
  TripConfig,
} from '../types/trip';
import { formatMoney } from '../utils/budget';

interface TripDownViewProps {
  config: TripConfig;
  budget: BudgetBreakdown;
  onUpdateConfig: (updater: (prev: TripConfig) => TripConfig) => void;
}

export function TripDownView({
  config,
  budget,
  onUpdateConfig,
}: TripDownViewProps) {
  const seasonMult = config.season === 'peak' ? 1.28 : 1.0;
  const airportFlights = FLIGHT_OPTIONS.filter((f) => f.from === config.airport);

  const selectAirport = (airport: DepartureAirport) => {
    const rec =
      FLIGHT_OPTIONS.find((f) => f.from === airport && f.recommended) ??
      FLIGHT_OPTIONS.find((f) => f.from === airport);
    onUpdateConfig((prev) => ({
      ...prev,
      airport,
      selectedFlightId: rec ? rec.id : prev.selectedFlightId,
    }));
  };

  const selectFlight = (flightId: string) => {
    onUpdateConfig((prev) => ({ ...prev, selectedFlightId: flightId }));
  };

  const selectTransit = (mode: TransitMode) => {
    onUpdateConfig((prev) => ({ ...prev, transitMode: mode }));
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Section Header + Maine Airport Switcher */}
      <section className="rounded-3xl bg-[#0F4C5C] text-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#F4B99B] text-[11px] font-semibold uppercase tracking-wider">
          <PlaneTakeoff className="w-3.5 h-3.5" /> The Trip Down (Round-Trip)
        </div>
        <h2 className="font-display text-xl font-semibold mt-1">
          Maine → Tampa Bay Flights & Wheels
        </h2>
        <p className="text-xs text-white/80 mt-1 leading-relaxed">
          Flying beats a 22-hour I-95 drive each way. Pick your Maine departure airport to compare real Tier 2 nonstop options.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3.5">
          {(['PWM', 'BGR'] as const).map((code) => {
            const active = config.airport === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => selectAirport(code)}
                className={`p-2.5 rounded-2xl text-left border transition-all active:scale-95 ${
                  active
                    ? 'bg-white text-[#0F4C5C] border-white shadow-xs'
                    : 'bg-white/10 text-white border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{code}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      active ? 'bg-[#0F4C5C]/10 text-[#0F4C5C]' : 'bg-white/15 text-white'
                    }`}
                  >
                    {code === 'PWM' ? '→ TPA' : '→ PIE/TPA'}
                  </span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {code === 'PWM' ? 'Portland Jetport' : 'Bangor Intl'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Flight Options */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[#1A2426]">
            {config.airport === 'PWM' ? 'Portland (PWM)' : 'Bangor (BGR)'} Flight Picks
          </h3>
          <span className="text-[11px] font-semibold text-[#5C6B6E]">
            {config.season === 'peak' ? 'Peak Winter Rates' : 'Shoulder Rates'}
          </span>
        </div>

        {airportFlights.map((flight) => {
          const isSelected = config.selectedFlightId === flight.id;
          const adjustedBase = Math.round(flight.baseRoundTrip * seasonMult);
          const allIn = adjustedBase + flight.bagAndSeatFees;

          return (
            <button
              key={flight.id}
              type="button"
              onClick={() => selectFlight(flight.id)}
              className={`w-full text-left rounded-2xl p-3.5 border transition-all active:scale-[0.99] ${
                isSelected
                  ? 'bg-white border-[#0F4C5C] ring-2 ring-[#0F4C5C]/15 shadow-sm'
                  : 'bg-white border-[#E6E1D8]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-[#1A2426]">
                      {flight.airline}
                    </span>
                    {flight.recommended && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E06D53]/12 text-[#C8533A]">
                        <Sparkles className="w-2.5 h-2.5" /> Tier 2 Pick
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#5C6B6E] mt-1">
                    <span className="font-semibold text-[#0F4C5C]">{flight.from}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-semibold text-[#0F4C5C]">{flight.to}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{flight.duration}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-[#1A2426] tabular-nums">
                    {formatMoney(allIn)}
                  </div>
                  <div className="text-[10px] text-[#6B7A7D]">RT all-in / ea</div>
                </div>
              </div>

              {/* Flight Times */}
              <div className="grid grid-cols-2 gap-2 mt-3 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] p-2.5 text-[11px]">
                <div>
                  <span className="text-[10px] uppercase text-[#7D8A8D] font-semibold block">
                    Outbound (Day 1)
                  </span>
                  <span className="font-semibold text-[#1A2426]">
                    {flight.departTime} → {flight.arriveTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#7D8A8D] font-semibold block">
                    Return (Day {config.days})
                  </span>
                  <span className="font-semibold text-[#1A2426]">
                    {flight.returnDepart} → {flight.returnArrive}
                  </span>
                </div>
              </div>

              {/* Fee Transparency */}
              <div className="flex items-center justify-between text-[11px] text-[#5C6B6E] mt-2.5">
                <span className="flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-[#0F4C5C]" />
                  Fare {formatMoney(adjustedBase)} + Seat/Bag {formatMoney(flight.bagAndSeatFees)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    isSelected ? 'text-[#0F4C5C]' : 'text-[#8D989A]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Selected
                    </>
                  ) : (
                    'Tap to pick'
                  )}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {flight.perks.map((perk) => (
                  <span
                    key={perk}
                    className="text-[10.5px] px-2 py-0.5 rounded-md bg-[#F2EEE7] text-[#455356]"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </section>

      {/* Local Transit Picker */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[#1A2426] flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#0F4C5C]" /> Getting Around Florida
          </h3>
          <span className="text-xs font-bold text-[#0F4C5C] tabular-nums">
            {formatMoney(budget.transitPerPerson)}/ea
          </span>
        </div>

        {TRANSIT_OPTIONS.map((option) => {
          const isSelected = config.transitMode === option.id;
          const total = option.dailyCost * config.days + option.extrasFlat;
          const perPerson = Math.round(total / config.travelers);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectTransit(option.id)}
              className={`w-full text-left rounded-2xl p-3.5 border transition-all active:scale-[0.99] ${
                isSelected
                  ? 'bg-white border-[#0F4C5C] ring-2 ring-[#0F4C5C]/15 shadow-sm'
                  : 'bg-white border-[#E6E1D8]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-[#1A2426]">
                    {option.name}
                  </div>
                  <p className="text-xs text-[#5C6B6E] mt-0.5">{option.tagline}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#1A2426] tabular-nums">
                    {formatMoney(perPerson)}/ea
                  </div>
                  {config.travelers > 1 && (
                    <div className="text-[10px] text-[#2D6A4F] font-semibold">
                      {formatMoney(total)} split {config.travelers} ways
                    </div>
                  )}
                </div>
              </div>

              <ul className="mt-2.5 space-y-1">
                {option.pros.map((pro) => (
                  <li
                    key={pro}
                    className="text-[11.5px] text-[#455356] flex items-start gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] p-2.5 space-y-1">
                {option.tips.map((tip) => (
                  <p
                    key={tip}
                    className="text-[11px] text-[#5C6B6E] flex items-start gap-1.5 leading-snug"
                  >
                    <Info className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            </button>
          );
        })}
      </section>

      {/* Door-to-Door Travel Day Timeline */}
      <section className="rounded-2xl bg-white border border-[#E6E1D8] p-4">
        <h3 className="font-display text-base font-semibold text-[#1A2426] flex items-center gap-1.5 mb-3">
          <PlaneLanding className="w-4 h-4 text-[#E06D53]" /> Door-to-Door Travel Day
        </h3>
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6E1D8]">
          {TRAVEL_DAY_STEPS.map((item) => (
            <div key={item.step} className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#0F4C5C] text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white">
                {item.step}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#E06D53]">
                  {item.timeOffset}
                </span>
              </div>
              <h4 className="text-[13px] font-bold text-[#1A2426] mt-0.5">
                {item.title}
              </h4>
              <p className="text-xs text-[#5C6B6E] mt-0.5 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
