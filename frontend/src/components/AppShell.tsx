import React, { useState } from 'react';
import { Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { CompassIcon, PlusIcon, LogOutIcon, SettingsIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { to: '/dashboard', label: 'My trips' },
  { to: '/explore', label: 'Explore' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Layout level Auth guard
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: { pathname } }} replace />;
  }

  return (
    <div className="min-h-full w-full bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Link to="/" className="flex items-center gap-2 text-ink" aria-label="GlobeTrotter home">
            <CompassIcon className="h-5 w-5 text-clay" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-tight">GlobeTrotter</span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to === '/dashboard' && pathname.startsWith('/trips'));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out',
                    active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-sunk'
                  ].join(' ')}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3 relative">
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-clay-deep"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              New trip
            </Link>

            {/* Profile Avatar Trigger */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="grid h-9 w-9 place-items-center rounded-full bg-pine text-sm font-semibold text-white cursor-pointer hover:opacity-90 shadow-sm border border-white"
                aria-label={`Signed in as ${user?.name}`}
                title={user?.name}
              >
                {user?.avatar || 'US'}
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-paper-raised p-1.5 shadow-lift z-40 text-xs">
                  <div className="px-3 py-2 border-b border-line">
                    <p className="font-semibold text-ink truncate">{user?.name}</p>
                    <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-paper-sunk/60 font-medium rounded-lg"
                    >
                      <SettingsIcon className="h-3.5 w-3.5 text-ink-muted" />
                      Settings
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-paper-sunk/60 font-medium rounded-lg"
                      >
                        <ShieldCheckIcon className="h-3.5 w-3.5 text-ink-muted" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-line pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-clay hover:bg-clay-soft/45 font-semibold rounded-lg text-left"
                    >
                      <LogOutIcon className="h-3.5 w-3.5 text-clay shrink-0" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}