import React from 'react';
import { TrendingDownIcon, AlertTriangleIcon, SparklesIcon, DollarSignIcon } from 'lucide-react';
import { getCity } from '../data/cities';
import { costForTrip } from '../utils/budget';
import { money, pluralize } from '../utils/format';
import { BudgetBar } from './BudgetBar';
import type { Trip } from '../types/trip';

const tones = ['bg-pine', 'bg-clay', 'bg-gold', 'bg-ink-soft'];
const hexTones = ['#1F4D45', '#B9502A', '#B48420', '#4A453D'];

export function BudgetPanel({ trip }: { trip: Trip }) {
  const cost = costForTrip(trip);
  const categories = [
    { label: 'Lodging', value: cost.lodging },
    { label: 'On the ground', value: cost.living },
    { label: 'Activities', value: cost.activities },
    { label: 'Transport', value: cost.transport }
  ];

  const perDay = cost.nights > 0 ? cost.total / cost.nights : 0;
  const priciest = [...cost.perStop].sort((a, b) => b.total - a.total)[0];
  const priciestCity = priciest
    ? getCity(trip.stops.find((s) => s.id === priciest.stopId)?.cityId ?? '')
    : undefined;

  // Donut Chart Calculations
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~251.2
  let accumulatedPercent = 0;

  const isOverBudget = cost.total > trip.budgetCap;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        {/* Core Budget Highlights */}
        <div className="rounded-2xl border border-line bg-paper-raised p-7 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold">Budget Summary</h3>
            {isOverBudget ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-deep animate-pulse">
                <AlertTriangleIcon className="h-3.5 w-3.5" />
                Over budget
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-soft px-3 py-1 text-xs font-semibold text-pine">
                <SparklesIcon className="h-3.5 w-3.5" />
                Under budget
              </span>
            )}
          </div>

          <div className="mt-5">
            <BudgetBar spent={cost.total} cap={trip.budgetCap} />
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center gap-8 border-t border-line pt-6">
            {/* SVG Donut Chart */}
            {cost.total > 0 ? (
              <div className="relative h-32 w-32 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3EDE3" strokeWidth={strokeWidth} />
                  {categories.map((c, i) => {
                    const percent = c.value / cost.total;
                    const strokeLength = percent * circumference;
                    const strokeOffset = circumference - (percent * circumference);
                    const strokeDasharray = `${strokeLength} ${circumference}`;
                    // Calculate accumulated offset
                    const currentOffset = circumference - (accumulatedPercent * circumference);
                    accumulatedPercent += percent;

                    if (percent === 0) return null;

                    return (
                      <circle
                        key={c.label}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={hexTones[i]}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={currentOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 hover:scale-105 origin-center cursor-pointer"
                        title={`${c.label}: ${Math.round(percent * 100)}%`}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-ink-muted">Total Spent</span>
                  <span className="text-sm font-bold text-ink">{money(cost.total)}</span>
                </div>
              </div>
            ) : (
              <div className="h-32 w-32 shrink-0 rounded-full border-4 border-dashed border-line-strong flex items-center justify-center text-xs text-ink-muted">
                No costs
              </div>
            )}

            {/* Category legend */}
            <dl className="grid gap-4 grid-cols-2 flex-1 w-full">
              {categories.map((c, i) => (
                <div key={c.label} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-paper-sunk/30 transition-colors">
                  <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tones[i]}`} />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-semibold text-ink-soft">{c.label}</dt>
                    <dd className="font-display text-lg font-bold text-ink">
                      {money(c.value)}
                      <span className="ml-1.5 text-xs font-normal text-ink-muted">
                        {cost.total ? `${Math.round((c.value / cost.total) * 100)}%` : '0%'}
                      </span>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Cost by Stop breakdown */}
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight">Cost by stop</h3>
          <ul className="mt-4 space-y-3">
            {cost.perStop.map((s) => {
              const stop = trip.stops.find((x) => x.id === s.stopId);
              const city = stop ? getCity(stop.cityId) : undefined;
              const share = cost.total ? (s.total / cost.total) * 100 : 0;
              return (
                <li key={s.stopId} className="rounded-xl border border-line bg-paper-raised p-4 transition-all hover:border-line-strong">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-semibold text-ink">{city?.name}</p>
                    <p className="text-sm font-semibold text-ink-soft">
                      {money(s.total)} ·{' '}
                      <span className="text-xs font-normal text-ink-muted">
                        {s.nights > 0 ? `${money(Math.round(s.total / s.nights))}/night` : 'day trip'}
                      </span>
                    </p>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-paper-sunk">
                    <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${share}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sidebar Recommendations */}
      <aside className="h-fit space-y-5 rounded-2xl border border-line bg-paper-sunk p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Average per night</p>
          <p className="font-display text-4xl font-semibold mt-1">{money(Math.round(perDay))}</p>
          <p className="mt-1 text-xs text-ink-muted">
            across {pluralize(cost.nights, 'night')} for {pluralize(trip.travelers, 'traveler')}
          </p>
        </div>

        {isOverBudget && (
          <div className="rounded-xl border border-clay bg-clay-soft/40 p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-clay-deep">
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              Budget Alert
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              You are currently over budget by <span className="font-bold text-clay-deep">{money(cost.total - trip.budgetCap)}</span>. Review your transport costs and activities to get back on track.
            </p>
          </div>
        )}

        {priciestCity && (
          <div className="rounded-xl border border-line-strong bg-paper-raised p-4 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <TrendingDownIcon className="h-4 w-4 text-clay" aria-hidden="true" />
              Where to trim first
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              <span className="font-bold text-ink">{priciestCity.name}</span> is your most expensive stop at{' '}
              <span className="font-semibold">{money(priciest.total)}</span>. Dropping one night there saves about{' '}
              <span className="font-semibold">
                {money(priciestCity.lodgingPerNight + priciestCity.dailyLivingCost * trip.travelers)}
              </span>
              .
            </p>
          </div>
        )}

        <div className="rounded-xl bg-paper-raised/40 p-4 border border-line/55">
          <h4 className="text-xs font-semibold text-ink flex items-center gap-1">
            <SparklesIcon className="h-3 w-3 text-gold" />
            Budget Tip
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
            Try booking activities marked as <span className="font-semibold text-ink-soft">Free</span> (like walking tours or public parks) to keep experience costs down.
          </p>
        </div>

        <p className="text-[10px] leading-relaxed text-ink-muted">
          Estimates use typical local costs per city and exclude international flights into the first stop.
        </p>
      </aside>
    </div>
  );
}