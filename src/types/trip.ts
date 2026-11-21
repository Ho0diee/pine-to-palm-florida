export type DepartureAirport = 'PWM' | 'BGR';
export type SeasonType = 'shoulder' | 'peak';
export type TransitMode = 'rental' | 'rideshare';
export type TabId = 'plan' | 'trip' | 'stay' | 'eat' | 'explore';

export interface TripConfig {
  airport: DepartureAirport;
  days: 3 | 4 | 5;
  travelers: number;
  season: SeasonType;
  selectedFlightId: string;
  selectedAirbnbId: string;
  transitMode: TransitMode;
  selectedRestaurantIds: string[];
  selectedAttractionIds: string[];
  completedStopIds: string[];
  checkedChecklistIds: string[];
  customStops: CustomStop[];
}

export interface CustomStop {
  id: string;
  day: number;
  time: string;
  title: string;
  note: string;
  cost: number;
}

export interface FlightOption {
  id: string;
  from: DepartureAirport;
  fromCity: string;
  to: 'TPA' | 'PIE';
  toCity: string;
  airline: string;
  nonstop: boolean;
  duration: string;
  departTime: string;
  arriveTime: string;
  returnDepart: string;
  returnArrive: string;
  baseRoundTrip: number;
  bagAndSeatFees: number;
  perks: string[];
  recommended?: boolean;
  coords: [number, number];
}

export interface TransitOption {
  id: TransitMode;
  name: string;
  tagline: string;
  dailyCost: number;
  extrasFlat: number; // gas + tolls + beach parking estimate
  pros: string[];
  tips: string[];
}

export interface AirbnbOption {
  id: string;
  name: string;
  neighborhood: string;
  city: 'St. Pete' | 'St. Pete Beach' | 'Tampa' | 'Dunedin';
  vibe: string;
  nightlyBase: number;
  cleaningFee: number;
  serviceAndTaxRate: number; // e.g., 0.24 for Airbnb service + FL transient taxes
  rating: number;
  reviews: number;
  maxGuests: number;
  distanceToBeach: string;
  distanceToAirport: string;
  highlights: string[];
  description: string;
  image: string;
  badge?: string;
  coords: [number, number];
}

export type MealCategory = 'Coffee & Breakfast' | 'Lunch' | 'Dinner' | 'Drinks & Dessert';
export type AreaTag = 'St. Pete' | 'Tampa & Ybor' | 'Gulf Beaches';

export interface Restaurant {
  id: string;
  name: string;
  category: MealCategory;
  area: AreaTag;
  cuisine: string;
  priceLevel: '$' | '$$' | '$$$';
  estCostPerPerson: number;
  signatureOrder: string;
  whyGo: string;
  reservationTip: string;
  recommendedDay: number;
  coords: [number, number];
}

export type AttractionCategory = 'Beach' | 'On the Water' | 'Culture & Art' | 'Nature' | 'Headline';

export interface Attraction {
  id: string;
  name: string;
  category: AttractionCategory;
  area: AreaTag;
  estCostPerPerson: number;
  duration: string;
  bestTime: string;
  summary: string;
  insiderTip: string;
  recommendedDay: number;
  coords: [number, number];
}

export interface ItineraryStop {
  id: string;
  day: number;
  time: string;
  title: string;
  subtitle: string;
  kind: 'travel' | 'stay' | 'food' | 'activity' | 'relax';
  estCost?: number;
  costLabel?: string;
  tip?: string;
  linkedRestaurantId?: string;
  linkedAttractionId?: string;
}

export interface ChecklistItem {
  id: string;
  section: 'Book Ahead' | 'Maine Departure' | 'Florida Packing';
  text: string;
  timing?: string;
}

export interface BudgetBreakdown {
  flightsPerPerson: number;
  transitPerPerson: number;
  transitTotal: number;
  airbnbPerPerson: number;
  airbnbTotal: number;
  airbnbNightlyAllIn: number;
  foodPerPerson: number;
  activitiesPerPerson: number;
  customStopsPerPerson: number;
  totalPerPerson: number;
  groupTotal: number;
  tierStatus: 'under' | 'sweet-spot' | 'above';
}
