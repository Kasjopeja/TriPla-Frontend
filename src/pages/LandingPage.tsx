import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  History,
  MapPin,
  MessageSquare,
  Receipt,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const features = [
  {
    icon: MapPin,
    title: 'Atrakcje',
    body: 'Co i kiedy zwiedzacie, z adresami i godzinami. Po jednym kliknięciu w listę dnia.',
  },
  {
    icon: Receipt,
    title: 'Wydatki bez Excela',
    body: 'Dodaj koszt, podziel po równo lub indywidualnie. Aplikacja sama policzy, kto komu ile wisi.',
  },
  {
    icon: Users,
    title: 'Role w ekipie',
    body: 'Owner, edytor, uczestnik. Każdy widzi swoje, ale nikt nie zepsuje cudzej pracy.',
  },
  {
    icon: CalendarDays,
    title: 'Kalendarz',
    body: 'Wszystkie Twoje wyjazdy w jednym widoku miesiąca. Klik – i już jesteś w detalach.',
  },
  {
    icon: MessageSquare,
    title: 'Komentarze i odpowiedzi',
    body: 'Decyzje zostają tam, gdzie powinny – przy konkretnej wycieczce, nie w 12 czatach.',
  },
  {
    icon: History,
    title: 'Historia zmian',
    body: 'Kto, kiedy i co zmienił. Pełen audit log – bez detektywistycznej pracy.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Załóż konto',
    body: 'Email, hasło i jesteś. Bez kreatorów, bez kart kredytowych.',
  },
  {
    n: '02',
    title: 'Stwórz wycieczkę',
    body: 'Nazwa, daty, krótki opis. Stajesz się Ownerem, możesz zaprosić ekipę.',
  },
  {
    n: '03',
    title: 'Planujcie wspólnie',
    body: 'Atrakcje, wydatki, komentarze. TriPla pilnuje, kto co ma zrobić i komu odda 80 zł.',
  },
];

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/trips" replace />;

  return (
    <div className="-my-8 space-y-24 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient bg-[length:200%_200%] px-6 py-20 text-white shadow-glow animate-gradient-shift sm:px-12 sm:py-24">
        {/* Animowane bloby */}
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl animate-blob" />
        <div
          className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl animate-blob"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="pointer-events-none absolute right-1/3 top-1/2 h-48 w-48 rounded-full bg-mauve-300/30 blur-2xl animate-blob"
          style={{ animationDelay: '8s' }}
        />
        {/* Siatka kropek */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Nowy sposób na planowanie wyjazdów
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Wycieczki, które <span className="block text-white/90">same się ogarniają.</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg text-white/80">
              Atrakcje, podział kosztów, komentarze i kalendarz – wszystko w jednym
              miejscu. TriPla pilnuje rozliczeń, więc Wy możecie się skupić na samej
              podróży.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-semibold text-mauve-700 shadow-glow transition hover:scale-[1.02] hover:bg-white/95 active:scale-[0.99]"
              >
                Zacznij za darmo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Mam już konto
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-white/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Bez kart kredytowych · 0 zł · konto na zawsze
            </div>
          </div>

          {/* Mockup po prawej stronie */}
          <div className="relative hidden h-[460px] lg:block">
            {/* Główna karta */}
            <div className="absolute right-0 top-1/2 w-[340px] -translate-y-1/2 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-glow backdrop-blur-xl rotate-[-2deg] animate-float">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500" />
                  <div>
                    <div className="text-sm font-bold">Weekend w Krakowie</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">
                      01–04 cze 2026
                    </div>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                  Aktywne
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-white/70" />
                    Wawel
                  </span>
                  <span className="text-xs text-white/60">10:00</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-white/70" />
                    Nocleg · Alice
                  </span>
                  <span className="font-mono text-xs">600 PLN</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-white/70" />
                    3 osoby
                  </span>
                  <span className="text-xs text-white/60">po 200 zł</span>
                </div>
              </div>
            </div>

            {/* Karta rozliczenia – z lewej, lekko poniżej */}
            <div
              className="absolute left-0 top-10 w-[260px] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-glow backdrop-blur-xl rotate-[5deg] animate-float-2"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                Rozliczenie
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5">
                  <span className="text-white/90">Bob → Alice</span>
                  <span className="font-mono text-xs">120 zł</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5">
                  <span className="text-white/90">Carol → Alice</span>
                  <span className="font-mono text-xs">80 zł</span>
                </div>
              </div>
            </div>

            {/* Mała karta – kalendarz */}
            <div
              className="absolute bottom-0 right-12 w-[180px] rounded-2xl border border-white/15 bg-white/10 p-3 shadow-glow backdrop-blur-xl rotate-[-4deg] animate-float"
              style={{ animationDelay: '1.2s' }}
            >
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                <CalendarDays className="h-3 w-3" />
                Czerwiec
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-[9px]">
                {Array.from({ length: 21 }).map((_, i) => {
                  const isTrip = i >= 7 && i <= 10;
                  return (
                    <div
                      key={i}
                      className={
                        'flex h-5 items-center justify-center rounded ' +
                        (isTrip
                          ? 'bg-accent-400/80 font-bold text-white'
                          : 'text-white/50')
                      }
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-mauve-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mauve-700 dark:bg-mauve-800/40 dark:text-mauve-200">
            Co dostajesz w pakiecie
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Wszystko, co potrzebne <span className="gradient-text">do wyjazdu w 6.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            Bez 7 różnych aplikacji, bez excela, bez „zrzucania na konto" i pamiętania,
            kto kiedy ile wydał.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mauve-200 opacity-0 blur-2xl transition group-hover:opacity-100 dark:bg-mauve-700/50" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-mauve-700 dark:bg-none dark:bg-mauve-800/50 dark:text-mauve-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-bold">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="card p-10">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Jak to <span className="gradient-text">działa?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Trzy kroki, dwie minuty.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-extrabold text-white shadow-glow">
                {s.n}
              </div>
              <h3 className="mb-1.5 text-xl font-bold">{s.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient bg-[length:200%_200%] px-8 py-16 text-center text-white shadow-glow animate-gradient-shift">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl animate-blob" />
        <div
          className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl animate-blob"
          style={{ animationDelay: '4s' }}
        />
        <div className="relative mx-auto max-w-2xl">
          <Compass className="mx-auto mb-5 h-10 w-10 opacity-80" strokeWidth={1.8} />
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Następna wycieczka <span className="text-white/80">zaczyna się tutaj.</span>
          </h2>
          <p className="mb-8 text-white/80">
            Załóż konto, zaproś ekipę i zobacz, jakie to proste, kiedy nikt nie musi
            pamiętać, kto za co zapłacił.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-bold text-mauve-700 shadow-glow transition hover:scale-[1.02] hover:bg-white/95"
          >
            Zacznij za darmo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
