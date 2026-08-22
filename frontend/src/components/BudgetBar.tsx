import React from 'react';
import { money } from '../utils/format';

interface BudgetBarProps {
  spent: number;
  cap: number;
  compact?: boolean;
}

export function BudgetBar({ spent, cap, compact = false }: BudgetBarProps) {
  const ratio = cap > 0 ? spent / cap : 0;
  const over = spent > cap;
  const pct = Math.min(ratio, 1) * 100;
  const tone = over ? 'bg-clay' : ratio > 0.85 ? 'bg-gold' : 'bg-pine';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={
          compact ?
          'text-sm font-semibold text-ink' :
          'font-display text-2xl font-semibold text-ink'
          }>
          
          {money(spent)}
          <span className="text-sm font-normal text-ink-muted">
            {' '}
            of {money(cap)}
          </span>
        </p>
        <p
          className={`text-sm font-medium ${over ? 'text-clay' : 'text-pine'}`}>
          
          {over ?
          `${money(spent - cap)} over` :
          `${money(cap - spent)} left`}
        </p>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper-sunk"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cap}
        aria-valuenow={Math.round(spent)}
        aria-label="Budget used">
        
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${tone}`}
          style={{ width: `${pct}%` }} />
        
      </div>
    </div>);

}