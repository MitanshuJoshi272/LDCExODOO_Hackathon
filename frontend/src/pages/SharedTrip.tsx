import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CompassIcon, GlobeIcon, CopyIcon, CheckIcon, Share2Icon, Twitter, Facebook, Mail, Link as LinkIcon } from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { getCity } from '../data/cities';
import { costForTrip } from '../utils/budget';
import { longDate, money, pluralize, newId } from '../utils/format';
import { TimelineView } from '../components/TimelineView';

export function SharedTrip() {
  const { tripId = '' } = useParams();
  const navigate = useNavigate();
  const { getTrip, createTrip } = useTrips();
  const trip = getTrip(tripId);

  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [copiedTrip, setCopiedTrip] = useState(false);

  if (!trip) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">This plan is no longer available</h1>
        <p className="mt-2 text-ink-soft">The link may have expired or the trip was deleted.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
          Go to GlobeTrotter
        </Link>
      </div>
    );
  }

  const cost = costForTrip(trip);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDuplicateTrip = () => {
    setCopiedTrip(true);
    const duplicated = createTrip({
      name: `Copy of ${trip.name}`,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      budgetCap: trip.budgetCap,
      travelers: trip.travelers,
      stops: trip.stops.map((s) => ({
        ...s,
        id: newId('stop'),
        startDate: s.startDate,
        endDate: s.endDate
      }))
    });
    setTimeout(() => {
      navigate(`/trips/${duplicated.id}`);
    }, 1000);
  };

  return (
    <div className="min-h-full w-full bg-paper">
      <header className="border-b border-line bg-paper-raised/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <CompassIcon className="h-5 w-5 text-clay" aria-hidden="true" />
            <span className="font-display text-lg font-semibold">GlobeTrotter</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-sunk px-3 py-1 text-xs font-semibold text-ink-soft">
              <GlobeIcon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Shared plan · read only
            </span>

            {/* Share panel dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowShareDropdown(!showShareDropdown)}
                className="p-2 rounded-full border border-line bg-paper hover:bg-paper-sunk transition-colors"
                title="Share this trip"
              >
                <Share2Icon className="h-4 w-4 text-ink-soft" />
              </button>
              {showShareDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-paper-raised p-2.5 shadow-lift z-30 text-xs space-y-1">
                  <p className="px-2 pb-1.5 font-bold text-ink-muted uppercase tracking-wider text-[9px] border-b border-line">Share via</p>
                  {[
                    { label: 'Twitter / X', icon: Twitter, href: 'https://twitter.com' },
                    { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
                    { label: 'Email', icon: Mail, href: `mailto:?subject=${encodeURIComponent(trip.name)}` }
                  ].map((chan) => (
                    <a
                      key={chan.label}
                      href={chan.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-ink hover:bg-paper-sunk/60 rounded-lg font-medium"
                    >
                      <chan.icon className="h-3.5 w-3.5 text-ink-muted" />
                      {chan.label}
                    </a>
                  ))}
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-ink hover:bg-paper-sunk/60 rounded-lg font-medium text-left"
                  >
                    {copiedLink ? <CheckIcon className="h-3.5 w-3.5 text-pine" /> : <LinkIcon className="h-3.5 w-3.5 text-ink-muted" />}
                    {copiedLink ? 'Link copied!' : 'Copy URL link'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-12">
        <img src={trip.coverImage} alt="" className="h-64 w-full rounded-2xl object-cover shadow-sm" />

        <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.05] tracking-tight">{trip.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">{trip.description}</p>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-line py-5 sm:grid-cols-4">
          <div>
            <dt className="text-sm text-ink-muted">Departs</dt>
            <dd className="mt-0.5 font-medium">{longDate(trip.startDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Length</dt>
            <dd className="mt-0.5 font-medium">{pluralize(cost.nights, 'night')}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Route</dt>
            <dd className="mt-0.5 font-medium">{trip.stops.map((s) => getCity(s.cityId)?.name).join(' → ')}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Estimated cost</dt>
            <dd className="mt-0.5 font-medium">{money(cost.total)}</dd>
          </div>
        </dl>

        <section className="mt-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight">The plan</h2>
          <div className="mt-6">
            <TimelineView trip={trip} />
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-line bg-paper-raised p-8 text-center shadow-card">
          <h2 className="font-display text-2xl font-semibold">Want to copy this route?</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            Import this exact route layout to your planner dashboard. You can customize dates, stops and budgets.
          </p>
          <button
            onClick={handleDuplicateTrip}
            disabled={copiedTrip}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep disabled:opacity-50"
          >
            {copiedTrip ? (
              <>
                <CheckIcon className="h-4 w-4 shrink-0" />
                Importing to planner...
              </>
            ) : (
              'Copy Trip to Dashboard'
            )}
          </button>
        </section>
      </article>
    </div>
  );
}