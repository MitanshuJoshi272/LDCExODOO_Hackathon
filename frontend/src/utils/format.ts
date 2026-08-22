import { format, parseISO } from 'date-fns';

export function money(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

export function shortDate(iso: string): string {
  return format(parseISO(iso), 'MMM d');
}

export function longDate(iso: string): string {
  return format(parseISO(iso), 'EEE, MMM d yyyy');
}

export function dateRange(startIso: string, endIso: string): string {
  return `${shortDate(startIso)} – ${shortDate(endIso)}`;
}

export function parseDateIso(iso: string): Date {
  return parseISO(iso);
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return format(d, 'yyyy-MM-dd');
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}