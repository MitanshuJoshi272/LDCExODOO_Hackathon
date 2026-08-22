import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, SaveIcon, Trash2Icon, StarIcon, CheckIcon, GlobeIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cities } from '../data/cities';
import { money } from '../utils/format';

export function Settings() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [savedMsg, setSavedMsg] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US',
      language,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const savedCities = cities.filter((c) => user.savedDestinations.includes(c.id));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Account settings</h1>
        </div>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Settings Form */}
        <div className="space-y-6">
          <form onSubmit={handleSave} className="rounded-2xl border border-line bg-paper-raised p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold text-ink">Personal Profile</h2>
            <p className="mt-1 text-sm text-ink-soft mb-6">Manage how you are identified in GlobeTrotter.</p>

            {savedMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-pine-soft/40 border border-pine/20 p-3 text-sm text-pine font-medium">
                <CheckIcon className="h-4 w-4" />
                Settings saved successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="settings-name" className="block text-sm font-semibold text-ink">
                  Full Name
                </label>
                <input
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="settings-email" className="block text-sm font-semibold text-ink">
                  Email Address
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="settings-lang" className="block text-sm font-semibold text-ink">
                  Language Preference
                </label>
                <select
                  id="settings-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none"
                >
                  <option>English</option>
                  <option>Spanish (Español)</option>
                  <option>French (Français)</option>
                  <option>German (Deutsch)</option>
                  <option>Japanese (日本語)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-deep"
              >
                <SaveIcon className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>

          {/* Delete Account */}
          <div className="rounded-2xl border border-clay/20 bg-clay-soft/10 p-6">
            <h2 className="font-display text-xl font-semibold text-clay-deep">Danger Zone</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Permanently delete all your trips, account data, settings, and start fresh.
            </p>

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-clay px-4 py-2 text-sm font-semibold text-clay hover:bg-clay-soft/40"
              >
                <Trash2Icon className="h-4 w-4" />
                Delete Account...
              </button>
            ) : (
              <div className="mt-4 rounded-xl border border-clay/35 bg-paper p-4">
                <p className="text-sm font-medium text-ink">Are you absolutely sure? This cannot be undone.</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={deleteAccount}
                    className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay-deep"
                  >
                    Yes, delete everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper-sunk"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Destinations Sidebar */}
        <aside className="h-fit rounded-2xl border border-line bg-paper-sunk p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-gold fill-gold" />
            Wishlist ({savedCities.length})
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Destinations you have starred for future travel inspiration.</p>

          {savedCities.length === 0 ? (
            <p className="mt-6 text-center text-sm text-ink-muted italic bg-paper/50 rounded-xl p-6 border border-dashed border-line">
              No saved destinations yet. Explore cities to star them!
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {savedCities.map((city) => (
                <li key={city.id} className="group relative overflow-hidden rounded-xl border border-line bg-paper-raised p-3">
                  <div className="flex gap-3">
                    <img src={city.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-semibold text-sm text-ink">{city.name}</h4>
                      <p className="text-xs text-ink-muted">{city.country}</p>
                      <p className="mt-1 text-xs font-semibold text-clay">
                        {money(city.lodgingPerNight + city.dailyLivingCost)} <span className="font-normal text-ink-muted">/ day</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/trips/new"
                    state={{ cityId: city.id }}
                    className="absolute bottom-2 right-2 rounded-full bg-clay-soft px-2.5 py-1 text-xs font-semibold text-clay-deep opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Plan trip
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
