import React from 'react';
import { getCity } from '../data/cities';
import { getActivity } from '../data/activities';
import { addDaysIso, dateRange, money, parseDateIso } from '../utils/format';
import type { Trip, Stop, Activity } from '../types/trip';
import { CalendarIcon, MapPinIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';

interface CalendarViewProps {
  trip: Trip;
}

export function CalendarView({ trip }: CalendarViewProps) {
  if (trip.stops.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-paper-raised p-12 text-center text-ink-soft">
        Add stops to generate the calendar layout.
      </p>
    );
  }

  // Get range of dates
  const startStop = trip.stops[0];
  const lastStop = trip.stops[trip.stops.length - 1];
  const tripStart = startStop.startDate;
  const tripEnd = lastStop.endDate;

  const datesList: string[] = [];
  let curr = tripStart;
  while (curr <= tripEnd) {
    datesList.push(curr);
    // Add 1 day
    const nextDateObj = parseDateIso(curr);
    nextDateObj.setDate(nextDateObj.getDate() + 1);
    curr = nextDateObj.toISOString().split('T')[0];
  }

  // Find stop for a given date
  const getStopForDate = (dateStr: string): { stop: Stop; index: number } | null => {
    for (let i = 0; i < trip.stops.length; i++) {
      const stop = trip.stops[i];
      if (dateStr >= stop.startDate && dateStr < stop.endDate) {
        return { stop, index: i };
      }
      // If it is the absolute last day of the trip, include it in the last stop
      if (dateStr === lastStop.endDate && i === trip.stops.length - 1) {
        return { stop, index: i };
      }
    }
    return null;
  };

  const tones = [
    'border-pine/35 bg-pine-soft/20 text-pine',
    'border-clay/35 bg-clay-soft/20 text-clay-deep',
    'border-gold/35 bg-gold-soft/20 text-[#7A5711]',
    'border-ink/20 bg-paper-sunk/30 text-ink-soft'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-clay" />
            Calendar Planner
          </h3>
          <p className="text-sm text-ink-soft mt-0.5">
            Overview of days from {dateRange(tripStart, tripEnd)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {datesList.map((dateStr, index) => {
          const stopData = getStopForDate(dateStr);
          const dateObj = parseDateIso(dateStr);
          const stop = stopData?.stop;
          const stopIndex = stopData?.index ?? 0;
          const city = stop ? getCity(stop.cityId) : null;
          const colorClass = stop ? tones[stopIndex % tones.length] : 'border-line bg-paper text-ink-muted';

          // Group activities by date? In stop activities we just assign lists to stops.
          // For visual calendar, let's distribute activities of this stop across its nights
          // (e.g. show first activity on night 1, second on night 2, etc. or show all).
          // Showing all activities assigned to this stop is clean, but let's make it look like a list.
          const stopActivities = stop
            ? stop.activityIds.map((id) => getActivity(id)).filter((a): a is Activity => !!a)
            : [];

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border p-4 flex flex-col min-h-[160px] shadow-sm transition-shadow hover:shadow-lift bg-paper-raised ${
                stop ? 'border-line' : 'border-dashed border-line-strong'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <p className="text-xs font-medium text-ink-soft">Day {index + 1}</p>
                </div>
                {stop && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink text-paper">
                    Stop {stopIndex + 1}
                  </span>
                )}
              </div>

              {/* City Pill */}
              {city ? (
                <div className={`mt-3 px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${colorClass}`}>
                  <MapPinIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{city.name}</span>
                </div>
              ) : (
                <div className="mt-3 px-2.5 py-1.5 rounded-xl border border-dashed text-xs text-ink-muted text-center">
                  Transit / Unplanned
                </div>
              )}

              {/* Activities of stop */}
              <div className="mt-3 flex-1">
                {stopActivities.length > 0 ? (
                  <ul className="space-y-1">
                    {stopActivities.map((a) => (
                      <li key={a.id} className="text-[11px] font-medium text-ink-soft border-b border-line/30 pb-0.5 truncate" title={a.name}>
                        • {a.name} ({a.cost === 0 ? 'Free' : money(a.cost)})
                      </li>
                    ))}
                  </ul>
                ) : stop ? (
                  <p className="text-[10px] text-ink-muted italic">No activities added</p>
                ) : null}
              </div>

              {/* Stop Notes Snippet */}
              {stop && stop.notes && (
                <p className="mt-2 text-[10px] italic text-ink-soft bg-paper-sunk/30 px-1.5 py-1 rounded border-l border-line truncate" title={stop.notes}>
                  {stop.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
