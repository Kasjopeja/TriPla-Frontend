import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  History,
  MapPin,
  MessageSquare,
  Receipt,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { tripsApi } from '@/api/trips';
import { useAuthStore } from '@/store/auth';
import { getMyRole } from '@/utils/permissions';
import { AttractionsTab } from './TripTabs/AttractionsTab';
import { ParticipantsTab } from './TripTabs/ParticipantsTab';
import { ExpensesTab } from './TripTabs/ExpensesTab';
import { CommentsTab } from './TripTabs/CommentsTab';
import { HistoryTab } from './TripTabs/HistoryTab';
import { TripHeader } from './TripTabs/TripHeader';

type TabKey =
  | 'attractions'
  | 'participants'
  | 'expenses'
  | 'comments'
  | 'history';

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'attractions', label: 'Atrakcje', icon: MapPin },
  { key: 'participants', label: 'Uczestnicy', icon: Users },
  { key: 'expenses', label: 'Wydatki', icon: Receipt },
  { key: 'comments', label: 'Komentarze', icon: MessageSquare },
  { key: 'history', label: 'Historia', icon: History },
];

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'attractions';
  const currentUserId = useAuthStore((s) => s.userId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.details(tripId!),
    enabled: !!tripId,
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        <div className="card h-32 animate-pulse" />
        <div className="card h-64 animate-pulse" />
      </div>
    );
  if (error || !data)
    return (
      <p className="card px-4 py-3 text-red-700 dark:text-red-300">Nie udało się pobrać wycieczki.</p>
    );

  const myRole = getMyRole(data.participants, currentUserId);

  const setTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const counts: Record<TabKey, number | null> = {
    attractions: data.attractions.length,
    participants: data.participants.length,
    expenses: data.expenses.length,
    comments: data.comments.length,
    history: null,
  };

  return (
    <div className="space-y-6">
      <TripHeader trip={data} myRole={myRole} />

      <div className="card overflow-hidden">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-slate-200/70 px-3 pt-3"
          aria-label="Zakładki"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={
                  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-medium transition ' +
                  (isActive
                    ? 'bg-brand-gradient-soft text-brand-700 shadow-[inset_0_-2px_0_0_theme(colors.brand.500)] dark:bg-none dark:bg-mauve-700/40 dark:text-mauve-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {counts[tab.key] !== null && (
                  <span
                    className={
                      'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ' +
                      (isActive
                        ? 'bg-white/80 text-brand-700 dark:bg-mauve-700 dark:text-mauve-50'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300')
                    }
                  >
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          {activeTab === 'attractions' && (
            <AttractionsTab
              tripId={data.id}
              attractions={data.attractions}
              myRole={myRole}
            />
          )}
          {activeTab === 'participants' && (
            <ParticipantsTab
              tripId={data.id}
              ownerId={data.ownerId}
              participants={data.participants}
              myRole={myRole}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpensesTab
              tripId={data.id}
              expenses={data.expenses}
              participants={data.participants}
            />
          )}
          {activeTab === 'comments' && (
            <CommentsTab tripId={data.id} comments={data.comments} />
          )}
          {activeTab === 'history' && <HistoryTab tripId={data.id} />}
        </div>
      </div>
    </div>
  );
}
