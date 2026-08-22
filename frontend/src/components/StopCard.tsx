import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  MoonIcon,
  PlaneIcon,
  Trash2Icon,
  SearchIcon,
  SlidersHorizontalIcon,
  FilterIcon,
  InfoIcon
} from 'lucide-react';
import { getCity } from '../data/cities';
import { activitiesForCity, getActivity } from '../data/activities';
import { costForStop } from '../utils/budget';
import { dateRange, money, pluralize } from '../utils/format';
import type { Stop } from '../types/trip';

interface StopCardProps {
  stop: Stop;
  index: number;
  total: number;
  travelers: number;
  onUpdate: (patch: Partial<Stop>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onToggleActivity: (activityId: string) => void;
}

export function StopCard({
  stop,
  index,
  total,
  travelers,
  onUpdate,
  onRemove,
  onMove,
  onToggleActivity
}: StopCardProps) {
  const [open, setOpen] = useState(index === 0);
  const city = getCity(stop.cityId);
  const cost = costForStop(stop, travelers);
  const allActivities = activitiesForCity(stop.cityId);

  // Search/Filter states inside StopCard activity section
  const [actQuery, setActQuery] = useState('');
  const [actCat, setActCat] = useState('All');
  const [actCostLimit, setActCostLimit] = useState('All'); // 'All' | 'Free' | 'Under50' | '50Plus'
  const [hoveredActId, setHoveredActId] = useState<string | null>(null);

  if (!city) return null;

  // Filter activities
  const filteredOptions = allActivities.filter((a) => {
    const matchesQuery = !actQuery.trim() || a.name.toLowerCase().includes(actQuery.toLowerCase()) || a.description.toLowerCase().includes(actQuery.toLowerCase());
    const matchesCat = actCat === 'All' || a.category === actCat;
    let matchesCost = true;
    if (actCostLimit === 'Free') {
      matchesCost = a.cost === 0;
    } else if (actCostLimit === 'Under50') {
      matchesCost = a.cost > 0 && a.cost < 50;
    } else if (actCostLimit === '50Plus') {
      matchesCost = a.cost >= 50;
    }
    return matchesQuery && matchesCat && matchesCost;
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-paper-raised transition-all">
      <div className="flex gap-5 p-5">
        <img
          src={city.image}
          alt=""
          className="hidden h-24 w-24 shrink-0 rounded-xl object-cover sm:block"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="rounded-full bg-paper-sunk px-2.5 py-0.5 text-[10px] font-bold text-ink-soft">
              Stop {index + 1}
            </span>
            <h3 className="font-display text-2xl font-semibold leading-tight">
              {city.name}
            </h3>
            <span className="text-sm text-ink-muted">{city.country}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-soft">
            <span>{dateRange(stop.startDate, stop.endDate)}</span>
            <span className="flex items-center gap-1.5">
              <MoonIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {pluralize(cost.nights, 'night')}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {stop.activityIds.length === 1 ? '1 activity' : `${stop.activityIds.length} activities`}
            </span>
          </div>

          {stop.activityIds.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {stop.activityIds.map((id) => {
                const a = getActivity(id);
                if (!a) return null;
                return (
                  <li
                    key={id}
                    className="rounded-full border border-clay bg-clay-soft/30 px-2.5 py-1 text-xs font-semibold text-clay-deep"
                  >
                    {a.name}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-2xl font-semibold">
            {money(cost.total)}
          </p>
          <p className="text-xs text-ink-muted">estimated</p>
          <div className="mt-3 flex justify-end gap-1">
            <IconButton
              label={`Move ${city.name} earlier`}
              disabled={index === 0}
              onClick={() => onMove(-1)}
            >
              <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton
              label={`Move ${city.name} later`}
              disabled={index === total - 1}
              onClick={() => onMove(1)}
            >
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton label={`Remove ${city.name}`} onClick={onRemove} danger>
              <Trash2Icon className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="text-sm font-semibold text-clay transition-colors duration-150 ease-out hover:text-clay-deep"
        >
          {open ? 'Close details' : 'Edit dates, activities & notes'}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-5 py-5 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <LabelledInput
              label="Arrive"
              id={`${stop.id}-start`}
              type="date"
              value={stop.startDate}
              onChange={(v) => onUpdate({ startDate: v })}
            />

            <LabelledInput
              label="Depart"
              id={`${stop.id}-end`}
              type="date"
              value={stop.endDate}
              onChange={(v) => onUpdate({ endDate: v })}
            />

            <LabelledInput
              label="Travel in (per person)"
              id={`${stop.id}-transport`}
              type="number"
              value={String(stop.transportCost)}
              onChange={(v) => onUpdate({ transportCost: Number(v) || 0 })}
              icon={<PlaneIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            />
          </div>

          {/* Advanced Activity Search & Filters */}
          <fieldset className="border-t border-line pt-5">
            <legend className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <FilterIcon className="h-4 w-4 text-clay" />
              Activities in {city.name}
            </legend>

            {/* Sub-Filters toolbar */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={actQuery}
                  onChange={(e) => setActQuery(e.target.value)}
                  placeholder="Search activities..."
                  className="w-full rounded-xl border border-line bg-paper-raised py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-clay"
                />
              </div>

              <div>
                <select
                  value={actCat}
                  onChange={(e) => setActCat(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper-raised py-1.5 px-3 text-xs focus:outline-none focus:border-clay"
                >
                  <option value="All">All Categories</option>
                  <option value="Food">Food & Drink</option>
                  <option value="Culture">Culture & Arts</option>
                  <option value="Nature">Nature & Outdoors</option>
                  <option value="Nightlife">Nightlife</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              <div>
                <select
                  value={actCostLimit}
                  onChange={(e) => setActCostLimit(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper-raised py-1.5 px-3 text-xs focus:outline-none focus:border-clay"
                >
                  <option value="All">Any Price</option>
                  <option value="Free">Free Only</option>
                  <option value="Under50">Under $50</option>
                  <option value="50Plus">$50 and Over</option>
                </select>
              </div>
            </div>

            {/* Filter Results List */}
            {filteredOptions.length === 0 ? (
              <p className="mt-4 text-xs text-ink-muted italic text-center py-6 bg-paper-raised rounded-xl border border-dashed border-line">
                No local activities match your current search filters.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {filteredOptions.map((a) => {
                  const checked = stop.activityIds.includes(a.id);
                  const isHovered = hoveredActId === a.id;
                  return (
                    <li key={a.id} className="relative">
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors duration-150 ease-out h-full ${
                          checked
                            ? 'border-clay bg-clay-soft/40'
                            : 'border-line bg-paper-raised hover:border-line-strong'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleActivity(a.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-clay"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                            {a.name}
                            <button
                              type="button"
                              onMouseEnter={() => setHoveredActId(a.id)}
                              onMouseLeave={() => setHoveredActId(null)}
                              onClick={(e) => {
                                e.preventDefault();
                                setHoveredActId(hoveredActId === a.id ? null : a.id);
                              }}
                              className="text-ink-muted hover:text-clay shrink-0"
                            >
                              <InfoIcon className="h-3 w-3" />
                            </button>
                          </span>
                          <span className="block text-[11px] text-ink-soft mt-0.5">
                            {a.category} · {a.durationHours}h
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-ink">
                          {a.cost === 0 ? 'Free' : money(a.cost)}
                        </span>
                      </label>

                      {/* Tooltip / Quick preview overlay */}
                      {isHovered && (
                        <div className="absolute left-0 bottom-full mb-1.5 w-64 rounded-xl border border-line bg-ink p-3 shadow-lift text-[11px] text-paper z-20 space-y-1">
                          <p className="font-bold">{a.name}</p>
                          <p className="text-paper-sunk leading-relaxed">{a.description}</p>
                          <p className="text-[10px] text-clay-soft font-semibold pt-1 border-t border-paper/10">
                            Estimated: {a.durationHours} hours · {a.cost === 0 ? 'Free' : money(a.cost)}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </fieldset>

          <div className="mt-6">
            <label
              htmlFor={`${stop.id}-notes`}
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Notes
            </label>
            <textarea
              id={`${stop.id}-notes`}
              rows={2}
              value={stop.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Bookings, addresses, things to remember."
              className="w-full resize-none rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none"
            />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm sm:grid-cols-4">
            {[
              { label: 'Lodging', value: cost.lodging },
              { label: 'On the ground', value: cost.living },
              { label: 'Activities', value: cost.activities },
              { label: 'Transport', value: cost.transport }
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-ink-muted">{row.label}</dt>
                <dd className="font-medium text-ink">{money(row.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </article>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg border border-line transition-colors duration-150 ease-out disabled:opacity-35 ${
        danger ? 'text-clay hover:bg-clay-soft' : 'text-ink-soft hover:bg-paper-sunk'
      }`}
    >
      {children}
    </button>
  );
}

function LabelledInput({
  label,
  id,
  type,
  value,
  onChange,
  icon
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink"
      >
        {icon}
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none"
      />
    </div>
  );
}