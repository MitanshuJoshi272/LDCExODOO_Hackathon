import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ClockIcon, SlidersHorizontalIcon, PlusIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { cities } from '../data/cities';
import { activities, activitiesForCity } from '../data/activities';
import { useTrips } from '../contexts/TripContext';
import { money, addDaysIso } from '../utils/format';
import type { ActivityCategory } from '../types/trip';

const regions = ['All regions', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];
const budgets = [
  { label: 'Any budget', max: 5 },
  { label: 'Under $100 / day', max: 2 },
  { label: 'Under $180 / day', max: 3 }
];

const categoryStyles: Record<ActivityCategory, string> = {
  Food: 'bg-clay-soft text-clay-deep',
  Culture: 'bg-gold-soft text-[#7A5711]',
  Nature: 'bg-pine-soft text-pine',
  Nightlife: 'bg-paper-sunk text-ink-soft',
  Adventure: 'bg-pine-soft text-pine'
};

export function Explore() {
  const { trips, addStop } = useTrips();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState(regions[0]);
  const [budget, setBudget] = useState(budgets[0]);
  const [openCity, setOpenCity] = useState<string | null>(null);

  // Dropdown states
  const [activeSelectCityId, setActiveSelectCityId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cities.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      const matchesRegion = region === regions[0] || c.region === region;
      const matchesBudget = c.costIndex <= budget.max;
      return matchesQuery && matchesRegion && matchesBudget;
    });
  }, [query, region, budget]);

  const handleAddStopToTrip = (tripId: string, cityId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const last = trip.stops[trip.stops.length - 1];
    const start = last ? last.endDate : trip.startDate;

    addStop(trip.id, {
      cityId,
      startDate: start,
      endDate: addDaysIso(start, 3), // default 3 nights
      notes: 'Added from explore page.',
      activityIds: [],
      transportCost: 0
    });

    setActiveSelectCityId(null);
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Explore destinations</h1>
        <p className="mt-2 text-ink-soft">
          {activities.length} activities across {cities.length} cities. Open a city to see what it costs to actually spend a day there.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city, country or interest"
            aria-label="Search destinations"
            className="w-full rounded-full border border-line bg-paper-raised py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none"
          />
        </div>

        <label className="sr-only" htmlFor="region">Region</label>
        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-full border border-line bg-paper-raised px-4 py-2.5 text-sm font-medium text-ink focus:border-clay focus:outline-none"
        >
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="budget">Budget</label>
        <select
          id="budget"
          value={budget.label}
          onChange={(e) => setBudget(budgets.find((b) => b.label === e.target.value) ?? budgets[0])}
          className="rounded-full border border-line bg-paper-raised px-4 py-2.5 text-sm font-medium text-ink focus:border-clay focus:outline-none"
        >
          {budgets.map((b) => (
            <option key={b.label}>{b.label}</option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-line-strong bg-paper-raised py-20 text-center">
          <SlidersHorizontalIcon className="mx-auto h-6 w-6 text-ink-muted" aria-hidden="true" />
          <p className="mt-3 font-display text-xl font-semibold">Nothing matches those filters</p>
          <p className="mt-1 text-sm text-ink-soft">Try a wider budget or clear the region.</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {results.map((city) => {
            const list = activitiesForCity(city.id);
            const isOpen = openCity === city.id;
            const isSelectOpen = activeSelectCityId === city.id;

            return (
              <li key={city.id} className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
                <div className="flex gap-5 p-5">
                  <img src={city.image} alt={`${city.name}, ${city.country}`} className="h-28 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-display text-2xl font-semibold">{city.name}</h2>
                      <span className="text-sm text-ink-muted">{city.country}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{city.blurb}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                      <span className="font-medium text-ink">
                        {money(city.lodgingPerNight)}
                        <span className="font-normal text-ink-muted"> / night</span>
                      </span>
                      <span className="font-medium text-ink">
                        {money(city.dailyLivingCost)}
                        <span className="font-normal text-ink-muted"> / day on the ground</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line px-5 py-3 relative">
                  <button
                    type="button"
                    onClick={() => setOpenCity(isOpen ? null : city.id)}
                    aria-expanded={isOpen}
                    className="text-sm font-semibold text-clay transition-colors duration-150 ease-out hover:text-clay-deep"
                  >
                    {isOpen ? 'Hide' : `${list.length} things to do`}
                  </button>

                  <div className="flex gap-2 items-center">
                    {trips.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveSelectCityId(isSelectOpen ? null : city.id)}
                          className="flex items-center gap-1 rounded-full border border-line-strong px-3.5 py-1.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-paper-sunk"
                        >
                          Add to Trip
                          <ChevronDownIcon className="h-3.5 w-3.5" />
                        </button>
                        {isSelectOpen && (
                          <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl border border-line bg-paper-raised py-1 shadow-lift z-10 text-xs">
                            <p className="px-3 py-1.5 font-semibold text-ink-muted border-b border-line uppercase tracking-wider text-[10px]">Select active trip</p>
                            {trips.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => handleAddStopToTrip(t.id, city.id)}
                                className="flex w-full items-center justify-between px-3 py-2 text-ink hover:bg-paper-sunk/60 text-left font-medium"
                              >
                                <span className="truncate">{t.name}</span>
                                <PlusIcon className="h-3 w-3 text-ink-muted shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <Link
                      to="/trips/new"
                      state={{ cityId: city.id }}
                      className="rounded-full bg-clay px-3.5 py-1.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep"
                    >
                      Plan new trip
                    </Link>
                  </div>
                </div>

                {isOpen && (
                  <ul className="divide-y divide-line border-t border-line bg-paper">
                    {list.map((a) => (
                      <li key={a.id} className="flex items-start gap-4 px-5 py-3">
                        <span className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${categoryStyles[a.category]}`}>
                          {a.category}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{a.name}</p>
                          <p className="text-sm text-ink-soft">{a.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-ink">{a.cost === 0 ? 'Free' : money(a.cost)}</p>
                          <p className="flex items-center justify-end gap-1 text-xs text-ink-muted">
                            <ClockIcon className="h-3 w-3" aria-hidden="true" />
                            {a.durationHours}h
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}