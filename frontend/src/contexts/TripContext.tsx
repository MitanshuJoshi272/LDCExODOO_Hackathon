import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState } from
'react';
import { seedTrips } from '../data/trips';
import { getCity } from '../data/cities';
import { newId } from '../utils/format';
import type { Stop, Trip } from '../types/trip';

interface TripContextValue {
  trips: Trip[];
  getTrip: (id: string) => Trip | undefined;
  createTrip: (
  input: Omit<Trip, 'id' | 'stops' | 'isPublic'> & {stops?: Stop[];})
  => Trip;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addStop: (tripId: string, stop: Omit<Stop, 'id'>) => void;
  updateStop: (tripId: string, stopId: string, patch: Partial<Stop>) => void;
  removeStop: (tripId: string, stopId: string) => void;
  moveStop: (tripId: string, stopId: string, direction: -1 | 1) => void;
  toggleActivity: (tripId: string, stopId: string, activityId: string) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

function sortStops(stops: Stop[]): Stop[] {
  return [...stops].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function TripProvider({ children }: {children: React.ReactNode;}) {
  const [trips, setTrips] = useState<Trip[]>(seedTrips);

  const patchTrip = useCallback(
    (id: string, updater: (t: Trip) => Trip) => {
      setTrips((prev) => prev.map((t) => t.id === id ? updater(t) : t));
    },
    []
  );

  const value = useMemo<TripContextValue>(
    () => ({
      trips,
      getTrip: (id) => trips.find((t) => t.id === id),
      createTrip: (input) => {
        const trip: Trip = {
          ...input,
          id: newId('trip'),
          isPublic: false,
          stops: input.stops ?? []
        };
        setTrips((prev) => [trip, ...prev]);
        return trip;
      },
      updateTrip: (id, patch) => patchTrip(id, (t) => ({ ...t, ...patch })),
      deleteTrip: (id) => setTrips((prev) => prev.filter((t) => t.id !== id)),
      addStop: (tripId, stop) =>
      patchTrip(tripId, (t) => ({
        ...t,
        stops: sortStops([...t.stops, { ...stop, id: newId('stop') }])
      })),
      updateStop: (tripId, stopId, patch) =>
      patchTrip(tripId, (t) => ({
        ...t,
        stops: sortStops(
          t.stops.map((s) => s.id === stopId ? { ...s, ...patch } : s)
        )
      })),
      removeStop: (tripId, stopId) =>
      patchTrip(tripId, (t) => ({
        ...t,
        stops: t.stops.filter((s) => s.id !== stopId)
      })),
      moveStop: (tripId, stopId, direction) =>
      patchTrip(tripId, (t) => {
        const index = t.stops.findIndex((s) => s.id === stopId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= t.stops.length) return t;
        const next = [...t.stops];
        const [moved] = next.splice(index, 1);
        next.splice(target, 0, moved);
        return { ...t, stops: next };
      }),
      toggleActivity: (tripId, stopId, activityId) =>
      patchTrip(tripId, (t) => ({
        ...t,
        stops: t.stops.map((s) =>
        s.id === stopId ?
        {
          ...s,
          activityIds: s.activityIds.includes(activityId) ?
          s.activityIds.filter((a) => a !== activityId) :
          [...s.activityIds, activityId]
        } :
        s
        )
      }))
    }),
    [trips, patchTrip]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used inside a TripProvider');
  return ctx;
}

export function coverForCity(cityId: string): string {
  return getCity(cityId)?.image ?? '';
}