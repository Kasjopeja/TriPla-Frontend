import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-4xl font-bold text-slate-400">404</h1>
      <p className="mb-6 text-slate-600">Nie znaleziono strony.</p>
      <Link to="/" className="text-brand-600 hover:underline">
        Wróć na stronę główną
      </Link>
    </div>
  );
}
