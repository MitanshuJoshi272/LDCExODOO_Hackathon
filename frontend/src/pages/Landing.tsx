import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CompassIcon,
  MapPinnedIcon,
  WalletIcon,
  Share2Icon } from
'lucide-react';
import { cities } from '../data/cities';
import { money } from '../utils/format';

const capabilities = [
{
  icon: MapPinnedIcon,
  title: 'Stops, in the order you will actually travel',
  body: 'Add a city, set the dates, and the itinerary re-sequences itself. Nights, gaps and overlaps are calculated for you.'
},
{
  icon: WalletIcon,
  title: 'A budget that updates as you plan',
  body: 'Lodging, activities, transport and daily spend are estimated per stop, so you see the cost of a decision before you commit to it.'
},
{
  icon: Share2Icon,
  title: 'A plan worth sending to someone',
  body: 'Publish a read-only version of any trip. No account needed to open it, nothing editable by accident.'
}];


export function Landing() {
  const featured = cities.slice(0, 4);

  return (
    <div className="w-full bg-paper">
      <header className="mx-auto flex h-20 max-w-6xl items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <CompassIcon className="h-5 w-5 text-clay" aria-hidden="true" />
          <span className="font-display text-lg font-semibold tracking-tight">
            GlobeTrotter
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-2">
          <Link
            to="/explore"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-150 ease-out hover:bg-paper-sunk">
            
            Explore cities
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors duration-150 ease-out hover:bg-ink-soft">
            
            Open planner
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-[14ch] font-display text-6xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl">
              
              Plan the whole trip, not just the flight.
            </motion.h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              GlobeTrotter turns a vague idea — five weeks, three continents,
              a number you would rather not exceed — into a sequenced itinerary
              with a running cost beside it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/trips/new"
                className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-base font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep">
                
                Start a trip
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/share/trip-iberia"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-base font-medium text-ink transition-colors duration-150 ease-out hover:bg-paper-sunk">
                
                See a shared plan
              </Link>
            </div>
          </div>

          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
            className="relative">
            
            <img
              src="/8c7e3904-60e2-4274-a403-05bf03e9896a.jpg"
              alt="A traveler on a coastal cliff path at sunset"
              className="h-[380px] w-full rounded-2xl object-cover" />
            
            <figcaption className="absolute bottom-4 left-4 right-4 rounded-xl bg-paper-raised/95 p-4 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Iberian Slow Loop · 15 nights
              </p>
              <p className="mt-1 font-display text-xl font-semibold">
                Lisbon → Barcelona → Marrakech
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Estimated {money(4085)} for two, {money(115)} under cap
              </p>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto grid max-w-6xl gap-px bg-line px-0 md:grid-cols-3">
          {capabilities.map((c) =>
          <div key={c.title} className="bg-paper-raised p-8">
              <c.icon className="h-5 w-5 text-clay" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-ink">
                {c.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {c.body}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              Start from a city
            </h2>
            <p className="mt-2 max-w-lg text-ink-soft">
              Every destination carries its own nightly and daily cost, so the
              budget reacts the moment you add it to a plan.
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-deep sm:inline-flex">
            
            All destinations
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((city) =>
          <li key={city.id}>
              <Link
              to="/explore"
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised transition-shadow duration-200 ease-out hover:shadow-lift">
              
                <img
                src={city.image}
                alt={`${city.name}, ${city.country}`}
                className="h-40 w-full object-cover" />
              
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold">
                    {city.name}
                  </h3>
                  <p className="text-sm text-ink-muted">{city.country}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {city.blurb}
                  </p>
                  <p className="mt-4 border-t border-line pt-3 text-sm font-medium text-ink">
                    from {money(city.lodgingPerNight + city.dailyLivingCost)}
                    <span className="font-normal text-ink-muted"> / day</span>
                  </p>
                </div>
              </Link>
            </li>
          )}
        </ul>
      </section>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>GlobeTrotter — personalized travel planning.</p>
          <p>Estimates are indicative and exclude international flights.</p>
        </div>
      </footer>
    </div>);

}