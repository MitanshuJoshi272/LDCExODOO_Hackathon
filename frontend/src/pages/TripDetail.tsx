import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  GlobeIcon,
  LockIcon,
  PlusIcon,
  CalendarIcon,
  ListIcon,
  LayoutGridIcon,
  PlaneIcon
} from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { cities, getCity } from '../data/cities';
import { getActivity } from '../data/activities';
import { costForTrip } from '../utils/budget';
import { addDaysIso, dateRange, money, pluralize, parseDateIso } from '../utils/format';
import { StopCard } from '../components/StopCard';
import { TimelineView } from '../components/TimelineView';
import { BudgetPanel } from '../components/BudgetPanel';
import { BudgetBar } from '../components/BudgetBar';
import { CalendarView } from '../components/CalendarView';

type Tab = 'itinerary' | 'timeline' | 'calendar' | 'budget';

const tabs: { id: Tab; label: string }[] = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'budget', label: 'Budget' }
];

export function TripDetail() {
  const { tripId = '' } = useParams();
  const navigate = useNavigate();
  const {
    getTrip,
    updateTrip,
    addStop,
    updateStop,
    removeStop,
    moveStop,
    toggleActivity
  } = useTrips();
  
  const [tab, setTab] = useState<Tab>('itinerary');
  const [itineraryMode, setItineraryMode] = useState<'stops' | 'days'>('stops');
  const [copied, setCopied] = useState(false);

  const trip = getTrip(tripId);

  if (!trip) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Trip not found</h1>
        <p className="mt-2 text-ink-soft">It may have been deleted from this session.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
        >
          Back to my trips
        </Link>
      </div>
    );
  }

  const cost = costForTrip(trip);
  const last = trip.stops[trip.stops.length - 1];

  function handleAddStop(cityId: string, nights: number) {
    if (!trip) return;
    const start = last ? last.endDate : trip.startDate;
    addStop(trip.id, {
      cityId,
      startDate: start,
      endDate: addDaysIso(start, nights),
      notes: '',
      activityIds: [],
      transportCost: 0
    });
  }

  function handleShare() {
    if (!trip) return;
    updateTrip(trip.id, { isPublic: true });
    setCopied(true);
    // Write full link to clipboard
    const publicUrl = `${window.location.origin}/share/${trip.id}`;
    navigator.clipboard.writeText(publicUrl);
    window.setTimeout(() => setCopied(false), 2000);
  }

  // Generate day-by-day structure
  const getTripDaysList = () => {
    const days: { dayNumber: number; date: string; stop: any; stopIndex: number }[] = [];
    let dayNum = 1;

    trip.stops.forEach((stop, stopIndex) => {
      let curr = stop.startDate;
      while (curr < stop.endDate) {
        days.push({
          dayNumber: dayNum++,
          date: curr,
          stop,
          stopIndex
        });

        // Increment 1 day
        const dateObj = parseDateIso(curr);
        dateObj.setDate(dateObj.getDate() + 1);
        curr = dateObj.toISOString().split('T')[0];
      }
    });
    return days;
  };

  const dayList = getTripDaysList();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        My trips
      </Link>

      <header className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            {trip.name}
          </h1>
          <p className="mt-3 max-w-xl text-ink-soft">{trip.description}</p>
          <p className="mt-4 text-sm text-ink-muted">
            {trip.stops.length > 0 ? (
              `${dateRange(trip.stops[0].startDate, trip.stops[trip.stops.length - 1].endDate)} · ${pluralize(
                cost.nights,
                'night'
              )} · ${pluralize(trip.stops.length, 'stop')} · ${pluralize(trip.travelers, 'traveler')}`
            ) : (
              'No stops yet'
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-150 ease-out hover:bg-ink-soft"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CopyIcon className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? 'Link copied' : 'Share trip'}
            </button>
            <Link
              to={`/share/${trip.id}`}
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-paper-sunk"
            >
              Preview public page
            </Link>
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              {trip.isPublic ? (
                <>
                  <GlobeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Public link is live
                </>
              ) : (
                <>
                  <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Private
                </>
              )}
            </span>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-paper-raised p-6">
          <BudgetBar spent={cost.total} cap={trip.budgetCap} />
          <label htmlFor="cap" className="mt-5 block text-sm font-semibold text-ink">
            Budget cap
          </label>
          <input
            id="cap"
            type="number"
            min={0}
            step={1000}
            value={trip.budgetCap}
            onChange={(e) => updateTrip(trip.id, { budgetCap: Number(e.target.value) || 0 })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none"
          />
          <p className="mt-3 text-sm text-ink-soft">
            {cost.nights > 0
              ? `Currently ${money(Math.round(cost.total / cost.nights))} per night.`
              : 'Add a stop to start estimating.'}
          </p>
        </div>
      </header>

      {/* Tabs Menu */}
      <div role="tablist" aria-label="Trip views" className="mt-10 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-150 ease-out ${
              tab === t.id
                ? 'border-clay text-ink'
                : 'border-transparent text-ink-muted hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="py-8">
        {tab === 'itinerary' && (
          <div className="space-y-6">
            {/* Stops/Days Sub toggle bar */}
            {trip.stops.length > 0 && (
              <div className="flex justify-end items-center gap-1.5 p-1 bg-paper rounded-xl border border-line w-fit ml-auto">
                <button
                  onClick={() => setItineraryMode('stops')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    itineraryMode === 'stops' ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:bg-paper-sunk/50'
                  }`}
                >
                  <LayoutGridIcon className="h-3.5 w-3.5" />
                  Stops
                </button>
                <button
                  onClick={() => setItineraryMode('days')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    itineraryMode === 'days' ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:bg-paper-sunk/50'
                  }`}
                >
                  <ListIcon className="h-3.5 w-3.5" />
                  Day-by-Day
                </button>
              </div>
            )}

            {trip.stops.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line-strong bg-paper-raised p-12 text-center text-ink-soft">
                No stops yet. Add the first city below.
              </p>
            )}

            {itineraryMode === 'stops' ? (
              <div className="space-y-4">
                {trip.stops.map((stop, i) => (
                  <StopCard
                    key={stop.id}
                    stop={stop}
                    index={i}
                    total={trip.stops.length}
                    travelers={trip.travelers}
                    onUpdate={(patch) => updateStop(trip.id, stop.id, patch)}
                    onRemove={() => removeStop(trip.id, stop.id)}
                    onMove={(dir) => moveStop(trip.id, stop.id, dir)}
                    onToggleActivity={(activityId) => toggleActivity(trip.id, stop.id, activityId)}
                  />
                ))}
              </div>
            ) : (
              /* Day-by-Day sequential list layout */
              <div className="space-y-4">
                {dayList.map((day) => {
                  const city = getCity(day.stop.cityId);
                  const dateObj = parseDateIso(day.date);
                  const isArrivalDay = day.date === day.stop.startDate;
                  return (
                    <div
                      key={day.dayNumber}
                      className="flex gap-4 items-stretch overflow-hidden rounded-2xl border border-line bg-paper-raised p-5 hover:border-line-strong transition-all"
                    >
                      <div className="w-24 text-center shrink-0 border-r border-line pr-4 flex flex-col justify-center">
                        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="font-display text-2xl font-bold text-ink">Day {day.dayNumber}</p>
                        <p className="text-[10px] text-ink-soft mt-0.5">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-display text-lg font-bold text-ink">{city?.name}</h4>
                          <span className="text-xs text-ink-muted">{city?.country}</span>
                        </div>

                        {/* Travel Day Plane Indicator */}
                        {isArrivalDay && day.stop.transportCost > 0 && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-clay font-medium">
                            <PlaneIcon className="h-3 w-3" />
                            Arrive in city (Travel cost: {money(day.stop.transportCost)})
                          </p>
                        )}

                        {/* Activities for this day */}
                        <div className="mt-2.5">
                          {day.stop.activityIds.length > 0 ? (
                            <ul className="flex flex-wrap gap-1.5">
                              {day.stop.activityIds.map((actId: string) => {
                                const act = getActivity(actId);
                                if (!act) return null;
                                return (
                                  <li
                                    key={actId}
                                    className="text-[10px] font-semibold bg-pine-soft text-pine px-2 py-0.5 rounded-full border border-pine/10"
                                  >
                                    {act.name}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-xs text-ink-muted italic">No activities scheduled.</p>
                          )}
                        </div>

                        {/* Day note summary */}
                        {day.stop.notes && (
                          <p className="mt-2.5 text-xs text-ink-soft italic bg-paper-sunk/35 p-2 rounded-xl border border-line border-dashed">
                            {day.stop.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <AddStopForm onAdd={handleAddStop} />
          </div>
        )}

        {tab === 'timeline' && <TimelineView trip={trip} />}
        {tab === 'calendar' && <CalendarView trip={trip} />}
        {tab === 'budget' && <BudgetPanel trip={trip} />}
      </div>

      <div className="border-t border-line pt-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Done editing
        </button>
      </div>
    </div>
  );
}

function AddStopForm({ onAdd }: { onAdd: (cityId: string, nights: number) => void }) {
  const [cityId, setCityId] = useState(cities[0].id);
  const [nights, setNights] = useState(3);
  const city = getCity(cityId);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(cityId, nights);
      }}
      className="flex flex-wrap items-end gap-4 rounded-2xl border border-dashed border-line-strong bg-paper-raised p-5"
    >
      <div className="min-w-[200px] flex-1">
        <label htmlFor="add-city" className="mb-1.5 block text-sm font-semibold text-ink">
          Add a stop
        </label>
        <select
          id="add-city"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none"
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.country}
            </option>
          ))}
        </select>
      </div>

      <div className="w-32">
        <label htmlFor="add-nights" className="mb-1.5 block text-sm font-semibold text-ink">
          Nights
        </label>
        <input
          id="add-nights"
          type="number"
          min={1}
          max={30}
          value={nights}
          onChange={(e) => setNights(Number(e.target.value) || 1)}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none"
        />
      </div>

      <p className="flex-1 text-sm text-ink-soft">
        {city && `≈ ${money((city.lodgingPerNight + city.dailyLivingCost) * nights)} before activities`}
      </p>

      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep"
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        Add stop
      </button>
    </form>
  );
}