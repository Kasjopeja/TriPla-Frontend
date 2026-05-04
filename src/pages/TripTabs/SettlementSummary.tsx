import type { ExpenseDto, ParticipantDto } from '@/types';
import { computeSettlements, participantUser } from '@/utils/settlement';
import { formatUserShort } from '@/utils/user';

interface Props {
  expenses: ExpenseDto[];
  participants: ParticipantDto[];
}

export function SettlementSummary({ expenses, participants }: Props) {
  const transfers = computeSettlements(expenses);

  if (transfers.length === 0) {
    return (
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/40 dark:bg-emerald-900/20">
        <h3 className="mb-1 font-semibold text-emerald-800 dark:text-emerald-200">Rozliczenie</h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Wszystko się zgadza – nikt nikomu nic nie jest winien.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-900/20">
      <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
        Rozliczenie ({transfers.length}{' '}
        {transfers.length === 1 ? 'przelew' : 'przelewów'})
      </h3>
      <ul className="space-y-1 text-sm text-amber-900 dark:text-amber-100">
        {transfers.map((t, idx) => {
          const from = participantUser(t.from, participants);
          const to = participantUser(t.to, participants);
          return (
            <li key={idx} className="flex items-center gap-2">
              <span className="font-medium">
                {from ? formatUserShort(from) : t.from.slice(0, 8)}
              </span>
              <span>→</span>
              <span className="font-medium">
                {to ? formatUserShort(to) : t.to.slice(0, 8)}
              </span>
              <span className="ml-auto font-mono font-semibold">
                {t.amount.toFixed(2)} {t.currency}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
