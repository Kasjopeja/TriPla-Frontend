import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Compass, LogOut, Map } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useApplyTheme } from '@/store/theme';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  useApplyTheme();
  const { isAuthenticated, email, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <Compass className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold tracking-tight gradient-text">
              TriPla
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/trips"
                  className={({ isActive }) =>
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ' +
                    (isActive
                      ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-mauve-700/30 dark:text-mauve-100'
                      : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800')
                  }
                >
                  <Map className="h-4 w-4" />
                  Wycieczki
                </NavLink>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ' +
                    (isActive
                      ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-mauve-700/30 dark:text-mauve-100'
                      : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800')
                  }
                >
                  <Calendar className="h-4 w-4" />
                  Kalendarz
                </NavLink>
                <span className="ml-2 hidden text-xs text-slate-500 dark:text-slate-400 sm:inline">
                  {email}
                </span>
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="btn-ghost"
                  aria-label="Wyloguj"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <NavLink to="/login" className="btn-ghost">
                  Zaloguj
                </NavLink>
                <NavLink to="/register" className="btn-primary">
                  Rejestracja
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 animate-fade-in-up">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
