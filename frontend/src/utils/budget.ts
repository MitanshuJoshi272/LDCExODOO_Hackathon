import { differenceInCalendarDays, parseISO } from 'date-fns';
import { getCity } from '../data/cities';
import { getActivity } from '../data/activities';
import type { Stop, Trip, TripCost, StopCost } from '../types/trip';

export function nightsForStop(stop: Stop): number {
  const n = differenceInCalendarDays(
    parseISO(stop.endDate),
    parseISO(stop.startDate)
  );
  return Math.max(n, 0);
}

export function costForStop(stop: Stop, travelers: number): StopCost {
  const city = getCity(stop.cityId);
  const nights = nightsForStop(stop);
  const days = Math.max(nights, 1);
  const lodging = city ? city.lodgingPerNight * nights : 0;
  const living = city ? city.dailyLivingCost * days * travelers : 0;
  const activities = stop.activityIds.reduce((sum, id) => {
    const a = getActivity(id);
    return sum + (a ? a.cost * travelers : 0);
  }, 0);
  const transport = stop.transportCost * travelers;
  return {
    stopId: stop.id,
    nights,
    lodging,
    living,
    activities,
    transport,
    total: lodging + living + activities + transport
  };
}

export function costForTrip(trip: Trip): TripCost {
  const perStop = trip.stops.map((s) => costForStop(s, trip.travelers));
  return {
    perStop,
    nights: perStop.reduce((s, c) => s + c.nights, 0),
    lodging: perStop.reduce((s, c) => s + c.lodging, 0),
    living: perStop.reduce((s, c) => s + c.living, 0),
    activities: perStop.reduce((s, c) => s + c.activities, 0),
    transport: perStop.reduce((s, c) => s + c.transport, 0),
    total: perStop.reduce((s, c) => s + c.total, 0)
  };
}