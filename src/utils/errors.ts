import { AxiosError } from 'axios';

interface ApiProblemPayload {
  error?: string;
  detail?: string;
  title?: string;
}

interface Options {
  /** Komunikat dla 401 (np. „Niepoprawny email lub hasło" na ekranie logowania). */
  unauthorized?: string;
  /** Domyślny komunikat fallback gdy nic innego nie pasuje. */
  fallback?: string;
}

const DEFAULTS: Required<Options> = {
  unauthorized: 'Sesja wygasła – zaloguj się ponownie.',
  fallback: 'Wystąpił błąd. Spróbuj ponownie.',
};

export function getApiErrorMessage(error: unknown, options: Options = {}): string {
  const opts = { ...DEFAULTS, ...options };

  if (!error) return opts.fallback;

  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Brak połączenia z serwerem. Sprawdź czy API działa.';
    }
    const data = error.response.data as ApiProblemPayload | undefined;
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;
    if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail;
    if (typeof data?.title === 'string' && data.title.trim()) return data.title;

    const status = error.response.status;
    if (status === 400) return 'Niepoprawne dane formularza.';
    if (status === 401) return opts.unauthorized;
    if (status === 403) return 'Nie masz uprawnień do wykonania tej akcji.';
    if (status === 404) return 'Nie znaleziono zasobu.';
    if (status === 409) return 'Konflikt – ten zasób już istnieje albo zmienił się w międzyczasie.';
    if (status >= 500) return 'Błąd serwera. Spróbuj za chwilę.';

    return opts.fallback;
  }

  if (error instanceof Error && error.message) return error.message;
  return opts.fallback;
}
