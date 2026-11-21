import {
  AIRBNB_OPTIONS,
  ATTRACTIONS,
  FLIGHT_OPTIONS,
  RESTAURANTS,
  TIER_2_TARGET,
  TRANSIT_OPTIONS,
} from '../data/tripData';
import type { BudgetBreakdown, TripConfig } from '../types/trip';

export function calculateBudget(config: TripConfig): BudgetBreakdown {
  const nights = Math.max(1, config.days - 1);
  const seasonFlightMult = config.season === 'peak' ? 1.28 : 1.0;
  const seasonStayMult = config.season === 'peak' ? 1.32 : 1.0;

  const flight =
    FLIGHT_OPTIONS.find((f) => f.id === config.selectedFlightId) ??
    FLIGHT_OPTIONS.find((f) => f.from === config.airport) ??
    FLIGHT_OPTIONS[0];

  const airbnb =
    AIRBNB_OPTIONS.find((a) => a.id === config.selectedAirbnbId) ??
    AIRBNB_OPTIONS[0];

  const transit =
    TRANSIT_OPTIONS.find((t) => t.id === config.transitMode) ??
    TRANSIT_OPTIONS[0];

  const flightsPerPerson = Math.round(
    flight.baseRoundTrip * seasonFlightMult + flight.bagAndSeatFees
  );

  const transitTotal = Math.round(
    transit.dailyCost * config.days + transit.extrasFlat
  );
  const transitPerPerson = Math.round(transitTotal / config.travelers);

  const staySubtotal = Math.round(
    airbnb.nightlyBase * seasonStayMult * nights + airbnb.cleaningFee
  );
  const airbnbTotal = Math.round(staySubtotal * (1 + airbnb.serviceAndTaxRate));
  const airbnbNightlyAllIn = Math.round(airbnbTotal / nights);
  const airbnbPerPerson = Math.round(airbnbTotal / config.travelers);

  // Selected restaurants that fall within trip length + light grocery/coffee buffer
  const selectedMeals = RESTAURANTS.filter(
    (r) =>
      config.selectedRestaurantIds.includes(r.id) &&
      r.recommendedDay <= config.days
  );
  const plannedMealsCost = selectedMeals.reduce(
    (sum, r) => sum + r.estCostPerPerson,
    0
  );
  // Add modest daily snack/water/Publix buffer ($14/day) so food total is realistic even if only 2 restaurants picked/day
  const foodPerPerson = Math.round(plannedMealsCost + config.days * 14);

  const selectedActivities = ATTRACTIONS.filter(
    (a) =>
      config.selectedAttractionIds.includes(a.id) &&
      a.recommendedDay <= config.days
  );
  const activitiesPerPerson = selectedActivities.reduce(
    (sum, a) => sum + a.estCostPerPerson,
    0
  );

  const customStopsPerPerson = config.customStops
    .filter((s) => s.day <= config.days)
    .reduce((sum, s) => sum + (Number.isFinite(s.cost) ? s.cost : 0), 0);

  const totalPerPerson =
    flightsPerPerson +
    transitPerPerson +
    airbnbPerPerson +
    foodPerPerson +
    activitiesPerPerson +
    customStopsPerPerson;

  const groupTotal =
    flightsPerPerson * config.travelers +
    transitTotal +
    airbnbTotal +
    (foodPerPerson + activitiesPerPerson + customStopsPerPerson) *
      config.travelers;

  let tierStatus: BudgetBreakdown['tierStatus'] = 'sweet-spot';
  if (totalPerPerson < TIER_2_TARGET.min) tierStatus = 'under';
  else if (totalPerPerson > TIER_2_TARGET.max) tierStatus = 'above';

  return {
    flightsPerPerson,
    transitPerPerson,
    transitTotal,
    airbnbPerPerson,
    airbnbTotal,
    airbnbNightlyAllIn,
    foodPerPerson,
    activitiesPerPerson,
    customStopsPerPerson,
    totalPerPerson,
    groupTotal,
    tierStatus,
  };
}

export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}
