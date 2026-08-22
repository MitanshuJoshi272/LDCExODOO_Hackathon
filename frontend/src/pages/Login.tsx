import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CompassIcon, KeyRoundIcon, MailIcon, UserIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup' | 'forgot';

export function Login() {
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleQuickLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('maya@globetrotter.io', 'password');
      navigate(from, { replace: true });
    } catch (err) {
      setError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode !== 'forgot') {
      if (!password) {
        setError('Password is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        await signup(name, email, password);
        navigate(from, { replace: true });
      } else {
        await resetPassword(email);
        setSuccessMsg('Reset link sent! Please check your email inbox.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-paper p-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-ink">
            <CompassIcon className="h-8 w-8 text-clay" />
            <span className="font-display text-2xl font-bold tracking-tight">GlobeTrotter</span>
          </Link>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {mode === 'login' && "Plan your journeys, track budgets and share itineraries"}
            {mode === 'signup' && 'Join GlobeTrotter and map your next big adventure'}
            {mode === 'forgot' && "Enter your email and we'll send a recovery link"}
          </p>
        </div>

        <motion.div
          layout
          className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-raised p-8 shadow-card"
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {error && (
                <div className="rounded-xl bg-clay-soft/40 border border-clay/20 p-3 text-sm text-clay-deep font-medium">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl bg-pine-soft/40 border border-pine/20 p-3 text-sm text-pine font-medium">
                  {successMsg}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maya Rao"
                      className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm text-ink focus:border-clay focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <MailIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@globetrotter.io"
                    className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm text-ink focus:border-clay focus:outline-none"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-medium text-clay hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <KeyRoundIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm text-ink focus:border-clay focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-clay py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-deep disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Password Reset'}
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {mode === 'login' && (
            <div className="mt-6 border-t border-line pt-6">
              <button
                type="button"
                onClick={handleQuickLogin}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink-soft"
              >
                <span>Quick Log In as Maya Rao (Demo)</span>
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-ink-soft">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-semibold text-clay hover:underline">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-ink-soft">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-semibold text-clay hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
