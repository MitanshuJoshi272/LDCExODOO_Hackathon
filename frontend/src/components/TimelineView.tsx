import React from 'react';
import { PlaneIcon } from 'lucide-react';
import { getCity } from '../data/cities';
import { getActivity } from '../data/activities';
import { costForStop, nightsForStop } from '../utils/budget';
import { longDate, money, pluralize } from '../utils/format';
import type { Trip } from '../types/trip';

export function TimelineView({ trip }: {trip: Trip;}) {
  const totalNights = trip.stops.reduce((s, stop) => s + nightsForStop(stop), 0);

  if (trip.stops.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-paper-raised p-12 text-center text-ink-soft">
        Add a stop to see the timeline.
      </p>);

  }

  return (
    <div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Trip length ${pluralize(totalNights, 'night')} split across ${pluralize(trip.stops.length, 'stop')}`}>
        
        {trip.stops.map((stop, i) => {
          const nights = nightsForStop(stop);
          const width = totalNights ? nights / totalNights * 100 : 0;
          const tones = ['bg-pine', 'bg-clay', 'bg-gold', 'bg-ink-soft'];
          return (
            <div
              key={stop.id}
              className={tones[i % tones.length]}
              style={{ width: `${width}%` }} />);


        })}
      </div>

      <ol className="mt-8 space-y-0">
        {trip.stops.map((stop, i) => {
          const city = getCity(stop.cityId);
          const cost = costForStop(stop, trip.travelers);
          const last = i === trip.stops.length - 1;
          if (!city) return null;
          return (
            <li key={stop.id} className="relative flex gap-6 pb-10 last:pb-0">
              {!last &&
              <span
                aria-hidden="true"
                className="absolute left-[11px] top-6 h-full w-px bg-line-strong" />

              }
              <span
                aria-hidden="true"
                className="relative mt-1.5 h-[22px] w-[22px] shrink-0 rounded-full border-4 border-paper bg-ink" />
              

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-2xl font-semibold leading-tight">
                    {city.name}
                  </h3>
                  <p className="text-sm font-medium text-ink-soft">
                    {money(cost.total)} · {pluralize(cost.nights, 'night')}
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {longDate(stop.startDate)} → {longDate(stop.endDate)}
                </p>

                {stop.transportCost > 0 &&
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                    <PlaneIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Travel in: {money(stop.transportCost * trip.travelers)}
                  </p>
                }

                {stop.activityIds.length > 0 &&
                <ul className="mt-3 space-y-1.5">
                    {stop.activityIds.map((id) => {
                    const a = getActivity(id);
                    if (!a) return null;
                    return (
                      <li
                        key={id}
                        className="flex items-baseline justify-between gap-4 border-b border-line pb-1.5 text-sm last:border-0">
                        
                          <span className="text-ink">{a.name}</span>
                          <span className="shrink-0 text-ink-muted">
                            {a.durationHours}h ·{' '}
                            {a.cost === 0 ? 'Free' : money(a.cost)}
                          </span>
                        </li>);

                  })}
                  </ul>
                }

                {stop.notes &&
                <p className="mt-3 border-l-2 border-line-strong pl-3 text-sm italic text-ink-soft">
                    {stop.notes}
                  </p>
                }
              </div>
            </li>);

        })}
      </ol>
    </div>);

}