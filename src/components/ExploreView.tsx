import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Check,
  Clock,
  Compass,
  Lightbulb,
  Map as MapIcon,
  MapPin,
  Plus,
  Sun,
} from 'lucide-react';
import {
  AIRBNB_OPTIONS,
  ATTRACTIONS,
  FLIGHT_OPTIONS,
  RESTAURANTS,
} from '../data/tripData';
import type {
  AttractionCategory,
  BudgetBreakdown,
  TripConfig,
} from '../types/trip';
import { formatMoney } from '../utils/budget';

interface ExploreViewProps {
  config: TripConfig;
  budget: BudgetBreakdown;
  onUpdateConfig: (updater: (prev: TripConfig) => TripConfig) => void;
}

const CATEGORIES: ('All' | AttractionCategory)[] = [
  'All',
  'Beach',
  'On the Water',
  'Culture & Art',
  'Nature',
  'Headline',
];

function createCirclePin(color: string, symbol: string, size = 28) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${color};
      color:#ffffff;
      font-weight:700;
      font-size:${size > 30 ? 14 : 12}px;
      border-radius:9999px;
      border:2.5px solid #ffffff;
      box-shadow:0 3px 10px rgba(0,0,0,0.32);
      display:flex;
      align-items:center;
      justify-content:center;
    ">${symbol}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

export function ExploreView({
  config,
  budget,
  onUpdateConfig,
}: ExploreViewProps) {
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [catFilter, setCatFilter] = useState<'All' | AttractionCategory>('All');
  const [mapFilter, setMapFilter] = useState<'all' | 'stay' | 'eat' | 'go'>('all');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const toggleAttraction = (id: string) => {
    onUpdateConfig((prev) => ({
      ...prev,
      selectedAttractionIds: prev.selectedAttractionIds.includes(id)
        ? prev.selectedAttractionIds.filter((a) => a !== id)
        : [...prev.selectedAttractionIds, id],
    }));
  };

  const filtered = ATTRACTIONS.filter(
    (a) => catFilter === 'All' || a.category === catFilter
  );

  // Initialize / update Leaflet map when in map mode
  useEffect(() => {
    if (mode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [27.83, -82.63],
        zoom: 10,
        zoomControl: false,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds: [number, number][] = [];
    const selectedAirbnb =
      AIRBNB_OPTIONS.find((a) => a.id === config.selectedAirbnbId) ??
      AIRBNB_OPTIONS[0];
    const selectedFlight =
      FLIGHT_OPTIONS.find((f) => f.id === config.selectedFlightId) ??
      FLIGHT_OPTIONS[0];

    // Airport Marker
    if (mapFilter === 'all' || mapFilter === 'stay') {
      L.marker(selectedFlight.coords, {
        icon: createCirclePin('#0F4C5C', '✈', 32),
        zIndexOffset: 400,
      })
        .bindPopup(
          `<strong>${selectedFlight.to} Airport</strong><br/>${selectedFlight.airline} (${selectedFlight.from} → ${selectedFlight.to})`
        )
        .addTo(map);
      bounds.push(selectedFlight.coords);

      // Selected Airbnb Marker
      L.marker(selectedAirbnb.coords, {
        icon: createCirclePin('#E06D53', '🏠', 34),
        zIndexOffset: 500,
      })
        .bindPopup(
          `<strong>${selectedAirbnb.name}</strong><br/>${selectedAirbnb.neighborhood}<br/><span style="color:#0F4C5C;font-weight:600">${selectedAirbnb.distanceToBeach}</span>`
        )
        .addTo(map);
      bounds.push(selectedAirbnb.coords);
    }

    // Selected Restaurants
    if (mapFilter === 'all' || mapFilter === 'eat') {
      RESTAURANTS.filter((r) => config.selectedRestaurantIds.includes(r.id)).forEach(
        (r) => {
          L.marker(r.coords, {
            icon: createCirclePin('#2D6A4F', '🍴', 26),
          })
            .bindPopup(
              `<strong>${r.name}</strong><br/>${r.category} · ~${formatMoney(r.estCostPerPerson)}/ea<br/><em>Order: ${r.signatureOrder}</em>`
            )
            .addTo(map);
          bounds.push(r.coords);
        }
      );
    }

    // Selected Attractions
    if (mapFilter === 'all' || mapFilter === 'go') {
      ATTRACTIONS.filter((a) => config.selectedAttractionIds.includes(a.id)).forEach(
        (a) => {
          L.marker(a.coords, {
            icon: createCirclePin('#B57614', '★', 26),
          })
            .bindPopup(
              `<strong>${a.name}</strong><br/>${a.category} · ${
                a.estCostPerPerson === 0 ? 'Free' : formatMoney(a.estCostPerPerson)
              }<br/>${a.duration}`
            )
            .addTo(map);
          bounds.push(a.coords);
        }
      );
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
    }

    setTimeout(() => map.invalidateSize(), 60);
  }, [
    mode,
    mapFilter,
    config.selectedAirbnbId,
    config.selectedFlightId,
    config.selectedRestaurantIds,
    config.selectedAttractionIds,
  ]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4 pb-6">
      {/* Header + Segmented Switch */}
      <section className="rounded-3xl bg-white border border-[#E6E1D8] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9A6721]">
              <Compass className="w-3.5 h-3.5" /> Places to Go & Bay Map
            </div>
            <h2 className="font-display text-xl font-semibold text-[#1A2426] mt-0.5">
              Beaches, Sails & Highlights
            </h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-[#0F4C5C] tabular-nums">
              {formatMoney(budget.activitiesPerPerson)}
            </div>
            <div className="text-[10.5px] text-[#6B7A7D]">
              {config.selectedAttractionIds.length} selected
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F2EEE7] rounded-xl">
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'list'
                ? 'bg-white text-[#0F4C5C] shadow-xs'
                : 'text-[#5C6B6E]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Places ({ATTRACTIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('map')}
            className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'map'
                ? 'bg-white text-[#0F4C5C] shadow-xs'
                : 'text-[#5C6B6E]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Live Trip Map
          </button>
        </div>
      </section>

      {mode === 'list' ? (
        <>
          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
            {CATEGORIES.map((cat) => {
              const active = catFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatFilter(cat)}
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

          {/* Places Cards */}
          <div className="space-y-3">
            {filtered.map((place) => {
              const isSelected = config.selectedAttractionIds.includes(place.id);
              return (
                <article
                  key={place.id}
                  className={`rounded-2xl bg-white border p-3.5 transition-all ${
                    isSelected
                      ? 'border-[#0F4C5C]/45 shadow-xs'
                      : 'border-[#E6E1D8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D9A05B]/18 text-[#8C5B15]">
                          {place.category}
                        </span>
                        <span className="text-[11px] text-[#5C6B6E] flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {place.area}
                        </span>
                      </div>
                      <h3 className="font-display text-[16px] font-semibold text-[#1A2426] leading-snug mt-1">
                        {place.name}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          place.estCostPerPerson === 0
                            ? 'text-[#2D6A4F]'
                            : 'text-[#1A2426]'
                        }`}
                      >
                        {place.estCostPerPerson === 0
                          ? 'Free'
                          : formatMoney(place.estCostPerPerson)}
                      </span>
                      <span className="text-[10px] text-[#6B7A7D] block">
                        Day {place.recommendedDay}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#455356] mt-2 leading-relaxed">
                    {place.summary}
                  </p>

                  <div className="flex items-center gap-3 mt-2.5 text-[11px] text-[#5C6B6E]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0F4C5C]" /> {place.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-[#E06D53]" /> {place.bestTime}
                    </span>
                  </div>

                  <div className="mt-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] px-2.5 py-2 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-[#D9822B] shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-[#455356] leading-snug">
                      {place.insiderTip}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleAttraction(place.id)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white'
                          : 'bg-[#F2EEE7] text-[#1A2426]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> On Your Itinerary
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add to Trip
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        /* Live Interactive Leaflet Map */
        <section className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All Pins' },
                { id: 'stay', label: 'Airbnb & Airport' },
                { id: 'eat', label: 'Selected Eats' },
                { id: 'go', label: 'Places to Go' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMapFilter(f.id)}
                className={`shrink-0 h-8 px-3 rounded-full text-[11.5px] font-semibold border transition-all ${
                  mapFilter === f.id
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                    : 'bg-white text-[#455356] border-[#E6E1D8]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#E6E1D8] shadow-sm bg-[#E8EFEF]">
            <div ref={mapContainerRef} className="w-full h-[390px]" />
          </div>

          {/* Map Legend */}
          <div className="rounded-2xl bg-white border border-[#E6E1D8] p-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold text-[#455356]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C]" /> Airport
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E06D53]" /> Your Airbnb
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" /> Locations to Eat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B57614]" /> Places to Go
            </span>
          </div>
          <p className="text-[11px] text-[#6B7A7D] text-center">
            Tap any pin on the map to see signature dishes, costs, and stay details.
          </p>
        </section>
      )}
    </div>
  );
}
