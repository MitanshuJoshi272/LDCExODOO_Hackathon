import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
  MoreVerticalIcon,
  CopyIcon,
  Trash2Icon,
  Edit2Icon,
  CheckIcon,
  CoinsIcon,
  CompassIcon
} from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import { cities, getCity } from '../data/cities';
import { costForTrip } from '../utils/budget';
import { longDate, money, pluralize, newId } from '../utils/format';
import { BudgetBar } from '../components/BudgetBar';

export function Dashboard() {
  const { trips, createTrip, updateTrip, deleteTrip } = useTrips();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editCap, setEditCap] = useState(0);
  const [editTravelers, setEditTravelers] = useState(1);

  const [next, ...rest] = trips;

  // Compute stats
  const totalBudget = trips.reduce((acc, t) => acc + t.budgetCap, 0);
  const totalNights = trips.reduce((acc, t) => acc + costForTrip(t).nights, 0);
  const totalStops = trips.reduce((acc, t) => acc + t.stops.length, 0);

  const handleDuplicate = (trip: any) => {
    createTrip({
      name: `Copy of ${trip.name}`,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      budgetCap: trip.budgetCap,
      travelers: trip.travelers,
      stops: trip.stops.map((s: any) => ({
        ...s,
        id: newId('stop'),
        startDate: s.startDate,
        endDate: s.endDate
      }))
    });
    setActiveMenuId(null);
  };

  const handleStartEdit = (trip: any) => {
    setEditingTrip(trip);
    setEditName(trip.name);
    setEditCap(trip.budgetCap);
    setEditTravelers(trip.travelers);
    setActiveMenuId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    updateTrip(editingTrip.id, {
      name: editName,
      budgetCap: editCap,
      travelers: editTravelers
    });
    setEditingTrip(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-muted">Welcome back, {user?.name || 'Maya'}</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">My trips</h1>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          New trip
        </Link>
      </header>

      {/* Stats Bar */}
      {trips.length > 0 && (
        <section className="mt-6 grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-line bg-line">
          {[
            { label: 'Total Stops Planned', value: totalStops, icon: MapPinIcon },
            { label: 'Total Travel Nights', value: totalNights, icon: CalendarDaysIcon },
            { label: 'Total Combined Budget', value: money(totalBudget), icon: CoinsIcon }
          ].map((stat, i) => (
            <div key={i} className="bg-paper-raised px-6 py-4 flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-clay shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{stat.label}</p>
                <p className="mt-0.5 font-display text-xl font-bold text-ink">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* List of trips */}
      {!next ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-paper-raised py-24 text-center">
          <h2 className="font-display text-2xl font-semibold">No trips yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-ink-soft">
            Start with a city and a date. You can add stops, activities and a budget as the idea takes shape.
          </p>
          <Link
            to="/trips/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white hover:bg-clay-deep"
          >
            Plan your first trip
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <FeaturedTrip tripId={next.id} />

          {rest.length > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Also planned</h2>
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((trip) => {
                  const cost = costForTrip(trip);
                  const isMenuOpen = activeMenuId === trip.id;
                  return (
                    <li key={trip.id} className="relative flex">
                      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised transition-shadow duration-200 ease-out hover:shadow-lift">
                        <Link to={`/trips/${trip.id}`} className="block relative h-32 w-full">
                          <img src={trip.coverImage} alt="" className="h-full w-full object-cover" />
                        </Link>

                        {/* Top-Right More actions */}
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : trip.id)}
                            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                          </button>
                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-36 rounded-xl border border-line bg-paper-raised py-1 shadow-card text-xs">
                              <button
                                onClick={() => handleStartEdit(trip)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-ink hover:bg-paper-sunk/60 text-left font-medium"
                              >
                                <Edit2Icon className="h-3 w-3" />
                                Edit Settings
                              </button>
                              <button
                                onClick={() => handleDuplicate(trip)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-ink hover:bg-paper-sunk/60 text-left font-medium"
                              >
                                <CopyIcon className="h-3 w-3" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => deleteTrip(trip.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-clay hover:bg-clay-soft/40 text-left font-semibold"
                              >
                                <Trash2Icon className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="font-display text-xl font-semibold leading-snug">
                            <Link to={`/trips/${trip.id}`} className="hover:text-clay">
                              {trip.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-ink-muted">
                            {pluralize(trip.stops.length, 'stop')} · {pluralize(cost.nights, 'night')}
                          </p>
                          <div className="mt-auto pt-5">
                            <BudgetBar spent={cost.total} cap={trip.budgetCap} compact />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Recommended Destinations Carousel */}
      <section className="mt-16">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Recommended Cities</h2>
            <p className="text-sm text-ink-soft mt-0.5">Explore hot destinations and plan trips there instantly.</p>
          </div>
        </div>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cities.slice(0, 4).map((city) => (
            <li key={city.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:border-line-strong hover:shadow-lift">
              <img src={city.image} alt="" className="h-32 w-full rounded-xl object-cover" />
              <div className="mt-3 flex-1">
                <h4 className="font-display text-lg font-bold text-ink">{city.name}</h4>
                <p className="text-xs text-ink-muted">{city.country}</p>
                <p className="text-xs text-ink-soft mt-1.5 line-clamp-2">{city.blurb}</p>
              </div>
              <div className="mt-4 border-t border-line pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">
                  {money(city.lodgingPerNight + city.dailyLivingCost)} <span className="font-normal text-ink-muted">/ day</span>
                </span>
                <button
                  onClick={() => navigate('/trips/new', { state: { cityId: city.id } })}
                  className="rounded-full bg-clay-soft px-3 py-1 text-xs font-bold text-clay-deep transition-colors hover:bg-clay hover:text-white"
                >
                  Plan Trip
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Edit Trip Details Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveEdit} className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 shadow-lift space-y-4">
            <h3 className="font-display text-xl font-semibold text-ink">Edit Trip settings</h3>
            <div>
              <label htmlFor="modal-name" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">Trip Name</label>
              <input
                id="modal-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="modal-budget" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">Budget Cap</label>
                <input
                  id="modal-budget"
                  type="number"
                  value={editCap}
                  onChange={(e) => setEditCap(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="modal-travelers" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">Travelers</label>
                <input
                  id="modal-travelers"
                  type="number"
                  min={1}
                  value={editTravelers}
                  onChange={(e) => setEditTravelers(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold text-ink hover:bg-paper-sunk"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-clay px-4 py-2 text-xs font-semibold text-white hover:bg-clay-deep"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function FeaturedTrip({ tripId }: { tripId: string }) {
  const { getTrip } = useTrips();
  const trip = getTrip(tripId);
  if (!trip) return null;
  const cost = costForTrip(trip);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-paper-raised shadow-card">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative min-h-[260px]">
          <img src={trip.coverImage} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-5 top-5 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-paper">
            Next departure
          </span>
        </div>

        <div className="flex flex-col p-8">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">{trip.name}</h2>
          <p className="mt-2 text-ink-soft">{trip.description}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-line py-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-ink-muted">
                <CalendarDaysIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Departs
              </dt>
              <dd className="mt-1 font-medium text-ink">{longDate(trip.startDate)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-ink-muted">
                <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Route
              </dt>
              <dd className="mt-1 font-medium text-ink">{pluralize(trip.stops.length, 'stop')}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-ink-muted">
                <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Party
              </dt>
              <dd className="mt-1 font-medium text-ink">{pluralize(trip.travelers, 'traveler')}</dd>
            </div>
          </dl>

          <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
            {trip.stops.map((stop, i) => (
              <li key={stop.id} className="flex items-center gap-2">
                <span className="font-medium text-ink">{getCity(stop.cityId)?.name}</span>
                {i < trip.stops.length - 1 && (
                  <span aria-hidden="true" className="text-ink-muted">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <BudgetBar spent={cost.total} cap={trip.budgetCap} />
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Link
              to={`/trips/${trip.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-150 ease-out hover:bg-ink-soft"
            >
              Open itinerary
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={`/share/${trip.id}`}
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-paper-sunk"
            >
              View shared page
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-4">
        {[
          { label: 'Lodging', value: cost.lodging },
          { label: 'On the ground', value: cost.living },
          { label: 'Activities', value: cost.activities },
          { label: 'Transport', value: cost.transport }
        ].map((row) => (
          <div key={row.label} className="bg-paper-raised px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{row.label}</p>
            <p className="mt-1 font-display text-xl font-semibold">{money(row.value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}