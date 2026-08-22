import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CompassIcon,
  UsersIcon,
  TrendingUpIcon,
  MapIcon,
  LayersIcon,
  DollarSignIcon,
  ActivityIcon,
  ArrowLeftIcon,
  PlusIcon,
  ChevronRightIcon
} from 'lucide-react';
import { cities } from '../data/cities';
import { activities } from '../data/activities';
import { useTrips } from '../contexts/TripContext';
import { money } from '../utils/format';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  time: string;
}

const mockActivityLogs: ActivityLog[] = [
  { id: '1', user: 'Maya Rao', action: 'Created trip', details: 'Iberian Slow Loop', time: '5 mins ago' },
  { id: '2', user: 'John Doe', action: 'Added stop', details: 'Kyoto (4 nights)', time: '14 mins ago' },
  { id: '3', user: 'Admin', action: 'Modified cost index', details: 'Rome lodging: $180', time: '1 hour ago' },
  { id: '4', user: 'Sarah Jenkins', action: 'Duplicated shared plan', details: 'Copy of Iberian Slow Loop', time: '3 hours ago' },
  { id: '5', user: 'Maya Rao', action: 'Added activity', details: 'Fado & Tapas in Lisbon', time: '4 hours ago' }
];

export function AdminDashboard() {
  const { trips } = useTrips();
  const [logs] = useState<ActivityLog[]>(mockActivityLogs);

  // Compute stats
  const totalTrips = trips.length;
  const avgBudget = totalTrips
    ? Math.round(trips.reduce((acc, t) => acc + t.budgetCap, 0) / totalTrips)
    : 0;

  // Let's count city frequency in current itineraries
  const cityCounts: Record<string, number> = {};
  trips.forEach((t) => {
    t.stops.forEach((s) => {
      cityCounts[s.cityId] = (cityCounts[s.cityId] || 0) + 1;
    });
  });

  const popularCitiesSorted = [...cities]
    .map((c) => ({
      ...c,
      count: cityCounts[c.id] || 0
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Admin & Analytics</h1>
        </div>
      </header>

      {/* Metrics Cards */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Trips Created', value: totalTrips, sub: 'All users active sessions', icon: MapIcon, color: 'text-clay bg-clay-soft' },
          { label: 'Avg. Budget Cap', value: money(avgBudget), sub: 'Trip spending caps', icon: DollarSignIcon, color: 'text-[#7A5711] bg-gold-soft' },
          { label: 'Registered Cities', value: cities.length, sub: 'Explore destinations DB', icon: CompassIcon, color: 'text-pine bg-pine-soft' },
          { label: 'Available Activities', value: activities.length, sub: 'Database actions items', icon: ActivityIcon, color: 'text-ink-soft bg-paper-sunk' }
        ].map((card, i) => (
          <div key={i} className="rounded-2xl border border-line bg-paper-raised p-6 shadow-card flex items-start gap-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{card.label}</p>
              <h3 className="mt-1 font-display text-2xl font-bold">{card.value}</h3>
              <p className="text-xs text-ink-soft mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts & Analytics */}
      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Popular Cities Table */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-ink mb-1">Destination Hotness</h2>
          <p className="text-sm text-ink-soft mb-5">Which cities are appearing most frequently in traveler itineraries.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-line text-ink-muted font-medium">
                  <th className="py-2.5">Destination</th>
                  <th className="py-2.5">Country</th>
                  <th className="py-2.5 text-right">Trip Mentions</th>
                  <th className="py-2.5 text-right">Daily Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {popularCitiesSorted.slice(0, 5).map((city) => (
                  <tr key={city.id} className="hover:bg-paper-sunk/30">
                    <td className="py-3 font-semibold flex items-center gap-2">
                      <img src={city.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      {city.name}
                    </td>
                    <td className="py-3 text-ink-soft">{city.country}</td>
                    <td className="py-3 text-right font-bold text-clay">{city.count} {city.count === 1 ? 'trip' : 'trips'}</td>
                    <td className="py-3 text-right">{money(city.lodgingPerNight + city.dailyLivingCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Analytics Bar Chart (SVG-based) */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6 shadow-card flex flex-col">
          <h2 className="font-display text-xl font-semibold text-ink mb-1">Itinerary Count Trends</h2>
          <p className="text-sm text-ink-soft mb-6">Aggregate distribution of trips across major budget caps.</p>

          {/* SVG Custom Graph */}
          <div className="flex-1 min-h-[180px] flex items-end gap-5 border-b border-line-strong pb-4 px-2">
            {[
              { cap: '< $1.5K', pct: totalTrips > 0 ? (trips.filter(t => t.budgetCap < 1500).length / totalTrips) * 100 : 20, count: trips.filter(t => t.budgetCap < 1500).length, fill: 'bg-pine' },
              { cap: '$1.5K - $3K', pct: totalTrips > 0 ? (trips.filter(t => t.budgetCap >= 1500 && t.budgetCap <= 3000).length / totalTrips) * 100 : 40, count: trips.filter(t => t.budgetCap >= 1500 && t.budgetCap <= 3000).length, fill: 'bg-clay' },
              { cap: '$3K - $5K', pct: totalTrips > 0 ? (trips.filter(t => t.budgetCap > 3000 && t.budgetCap <= 5000).length / totalTrips) * 100 : 25, count: trips.filter(t => t.budgetCap > 3000 && t.budgetCap <= 5000).length, fill: 'bg-gold' },
              { cap: '> $5K', pct: totalTrips > 0 ? (trips.filter(t => t.budgetCap > 5000).length / totalTrips) * 100 : 15, count: trips.filter(t => t.budgetCap > 5000).length, fill: 'bg-ink-soft' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-xs font-semibold text-ink-soft">{bar.count}</span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${bar.fill}`}
                  style={{ height: `${Math.max(bar.pct, 8)}%` }}
                />
                <span className="text-[10px] text-ink-muted font-medium whitespace-nowrap">{bar.cap}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted text-center">Graph updates automatically in real-time as users modify trip budget caps.</p>
        </div>
      </section>

      {/* Engagement Activity Logs */}
      <section className="mt-10 rounded-2xl border border-line bg-paper-raised p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold text-ink mb-1">Live Activity Stream</h2>
        <p className="text-sm text-ink-soft mb-5">Audit log of system actions occurring across the platform frontend.</p>

        <ul className="divide-y divide-line">
          {logs.map((log) => (
            <li key={log.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-paper-sunk text-xs font-bold text-ink">
                  {log.user.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm text-ink font-medium">
                    <span className="font-semibold">{log.user}</span> {log.action.toLowerCase()}:{' '}
                    <span className="text-ink-soft font-semibold">{log.details}</span>
                  </p>
                  <p className="text-xs text-ink-muted">{log.time}</p>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-ink-muted" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
