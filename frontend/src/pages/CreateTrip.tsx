import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, ImageIcon, LinkIcon } from 'lucide-react';
import { cities, getCity } from '../data/cities';
import { useTrips } from '../contexts/TripContext';
import { addDaysIso, money, newId } from '../utils/format';

const today = new Date();
const defaultStart = `${today.getFullYear() + 1}-04-10`;

const presetCovers = [
  { name: 'Lisbon Coastal', url: 'https://images.unsplash.com/photo-1509840144299-db508400a780?w=600&auto=format&fit=crop' },
  { name: 'Kyoto Temple', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop' },
  { name: 'Barcelona Street', url: 'https://images.unsplash.com/photo-1583779457094-0cfcf3600897?w=600&auto=format&fit=crop' },
  { name: 'Marrakech Souk', url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600&auto=format&fit=crop' },
  { name: 'London Sunset', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop' }
];

export function CreateTrip() {
  const navigate = useNavigate();
  const { createTrip } = useTrips();
  const location = useLocation() as { state?: { cityId?: string } };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(defaultStart);
  const [travelers, setTravelers] = useState(2);
  const [budgetCap, setBudgetCap] = useState(250000);
  const [cityId, setCityId] = useState(location.state?.cityId ?? cities[0].id);
  const [nights, setNights] = useState(4);
  const [error, setError] = useState<string | null>(null);

  // Cover Image Selection
  const [coverMode, setCoverMode] = useState<'city' | 'preset' | 'custom'>('city');
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(presetCovers[0].url);

  const city = getCity(cityId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give the trip a name so you can find it later.');
      return;
    }
    if (!city) return;

    let finalCover = city.image;
    if (coverMode === 'custom' && customCoverUrl.trim()) {
      finalCover = customCoverUrl.trim();
    } else if (coverMode === 'preset') {
      finalCover = selectedPresetUrl;
    }

    const trip = createTrip({
      name: name.trim(),
      description:
        description.trim() ||
        `A ${nights}-night start in ${city.name}, with room to add more stops.`,
      coverImage: finalCover,
      startDate,
      budgetCap,
      travelers,
      stops: [
        {
          id: newId('stop'),
          cityId: city.id,
          startDate,
          endDate: addDaysIso(startDate, nights),
          notes: '',
          activityIds: [],
          transportCost: 0
        }
      ]
    });
    navigate(`/trips/${trip.id}`);
  }

  const estimate = city
    ? city.lodgingPerNight * nights + city.dailyLivingCost * nights * travelers
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back to trips
      </Link>

      <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight">Start a trip</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Only the first stop is needed now. Dates, stops, activities, and covers are all editable once the itinerary exists.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 rounded-2xl border border-line bg-paper-raised p-7">
          <Field label="Trip name" htmlFor="name">
            <input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Iberian Slow Loop"
              className="input"
              aria-invalid={Boolean(error)}
            />
            {error && <p className="mt-1.5 text-sm font-medium text-clay">{error}</p>}
          </Field>

          <Field label="What is this trip about?" htmlFor="description" optional>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pace, priorities, anything you want to remember later."
              className="input resize-none"
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Start date" htmlFor="start">
              <input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Travelers" htmlFor="travelers">
              <input
                id="travelers"
                type="number"
                min={1}
                max={12}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value) || 1)}
                className="input"
              />
            </Field>
            <Field label="Budget cap (INR)" htmlFor="budget">
              <input
                id="budget"
                type="number"
                min={0}
                step={5000}
                value={budgetCap}
                onChange={(e) => setBudgetCap(Number(e.target.value) || 0)}
                className="input"
              />
            </Field>
          </div>

          {/* Cover Photo Customization */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Trip Cover Image</label>
            <div className="flex gap-2 p-1.5 bg-paper rounded-xl border border-line w-fit">
              {[
                { id: 'city', label: 'City Default', icon: ImageIcon },
                { id: 'preset', label: 'Preset Gallery', icon: ImageIcon },
                { id: 'custom', label: 'Custom URL', icon: LinkIcon }
              ].map((tab) => {
                const ActiveIcon = tab.icon;
                const active = coverMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCoverMode(tab.id as any)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      active ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:bg-paper-sunk/50'
                    }`}
                  >
                    <ActiveIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5">
              {coverMode === 'city' && (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-paper-sunk/35 p-3">
                  <img src={city?.image} alt="" className="h-12 w-20 rounded-lg object-cover" />
                  <p className="text-xs text-ink-soft">
                    Will use the primary image of <span className="font-semibold">{city?.name}</span>.
                  </p>
                </div>
              )}

              {coverMode === 'preset' && (
                <ul className="grid grid-cols-5 gap-2.5">
                  {presetCovers.map((p) => {
                    const selected = selectedPresetUrl === p.url;
                    return (
                      <li key={p.name}>
                        <button
                          type="button"
                          onClick={() => setSelectedPresetUrl(p.url)}
                          className={`group relative h-14 w-full overflow-hidden rounded-xl border transition-all ${
                            selected ? 'border-clay ring-1 ring-clay scale-95' : 'border-line hover:border-line-strong'
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                          {selected && (
                            <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-clay text-white">
                              <CheckIcon className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {coverMode === 'custom' && (
                <div className="relative">
                  <input
                    type="url"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input w-full"
                  />
                  {customCoverUrl && (
                    <div className="mt-3 h-20 w-full overflow-hidden rounded-xl border border-line">
                      <img
                        src={customCoverUrl}
                        alt="Custom cover preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">First stop</legend>
            <p className="mt-1 text-sm text-ink-soft">Pick where the trip begins. You can reorder and add more later.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {cities.slice(0, 6).map((c) => {
                const selected = c.id === cityId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setCityId(c.id)}
                      aria-pressed={selected}
                      className={`relative w-full overflow-hidden rounded-xl border text-left transition-colors duration-150 ease-out ${
                        selected ? 'border-clay ring-1 ring-clay' : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <img src={c.image} alt="" className="h-20 w-full object-cover" />
                      {selected && (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-clay text-white">
                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                      <span className="block px-3 py-2">
                        <span className="block text-sm font-semibold text-ink">{c.name}</span>
                        <span className="block text-xs text-ink-muted">{c.country}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <Field label={`Nights in ${city?.name ?? 'this city'}`} htmlFor="nights">
            <input
              id="nights"
              type="range"
              min={1}
              max={14}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="w-full accent-clay"
            />
            <p className="mt-1 text-sm text-ink-soft">{nights} nights</p>
          </Field>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-paper-sunk p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Opening estimate</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={`Lodging · ${nights} nights`} value={money((city?.lodgingPerNight ?? 0) * nights)} />
            <Row label={`On the ground · ${travelers} × ${nights} days`} value={money((city?.dailyLivingCost ?? 0) * nights * travelers)} />
          </dl>
          <p className="mt-4 border-t border-line-strong pt-4 font-display text-3xl font-semibold">{money(estimate)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {estimate > budgetCap
              ? `${money(estimate - budgetCap)} over your cap before activities.`
              : `${money(budgetCap - estimate)} left for activities and onward travel.`}
          </p>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep"
          >
            Create itinerary
          </button>
        </aside>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e7dfd2;
          background: #fff;
          padding: 0.625rem 0.875rem;
          font-size: 0.925rem;
          color: #1c1a17;
        }
        .input:focus {
          outline: none;
          border-color: #b9502a;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  children
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-ink-muted">optional</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}