import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme';

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
      title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
      className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
