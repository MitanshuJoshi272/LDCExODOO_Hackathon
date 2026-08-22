export type ActivityCategory =
'Food' |
'Culture' |
'Nature' |
'Nightlife' |
'Adventure';

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  image: string;
  blurb: string;
  /** Typical nightly lodging cost in INR */
  lodgingPerNight: number;
  /** Typical daily food + local transport cost in INR */
  dailyLivingCost: number;
  /** 1 = very affordable, 5 = very expensive */
  costIndex: number;
  popularity: number;
  tags: string[];
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: ActivityCategory;
  durationHours: number;
  cost: number;
  description: string;
}

export interface Stop {
  id: string;
  cityId: string;
  /** ISO date, inclusive */
  startDate: string;
  /** ISO date, exclusive-of-night (departure day) */
  endDate: string;
  notes: string;
  activityIds: string[];
  /** Cost of travelling INTO this stop */
  transportCost: number;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  budgetCap: number;
  travelers: number;
  isPublic: boolean;
  stops: Stop[];
}

export interface StopCost {
  stopId: string;
  nights: number;
  lodging: number;
  living: number;
  activities: number;
  transport: number;
  total: number;
}

export interface TripCost {
  lodging: number;
  living: number;
  activities: number;
  transport: number;
  total: number;
  perStop: StopCost[];
  nights: number;
}