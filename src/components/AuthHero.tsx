import {
  Compass,
  CalendarDays,
  Receipt,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  body: string;
  rotate: string;
  delay: string;
}

const features: FeatureCard[] = [
  {
    icon: CalendarDays,
    title: 'Plan',
    body: '3 atrakcje na dziś',
    rotate: '-rotate-3',
    delay: '0s',
  },
  {
    icon: Receipt,
    title: 'Wydatki',
    body: '600 PLN · po równo',
    rotate: 'rotate-3',
    delay: '0.2s',
  },
  {
    icon: Users,
    title: 'Ekipa',
    body: 'Alice + Bob + Carol',
    rotate: '-rotate-2',
    delay: '0.4s',
  },
];

interface Props {
  title: string;
  subtitle: string;
}

export function AuthHero({ title, subtitle }: Props) {
  return (
    // Wrapper – żeby uchwyt walizki mógł wystawać poza karton hero
    <div className="relative hidden md:block">
      {/* === Uchwyt walizki === */}
      <div className="pointer-events-none absolute left-1/2 -top-6 z-10 -translate-x-1/2">
        {/* Łukowa rączka – top-only border tworzy kształt U */}
        <div className="h-10 w-36 rounded-t-[2rem] border-[6px] border-mauve-900 border-b-0 bg-mauve-900/30 shadow-[0_4px_8px_rgba(0,0,0,0.35)]" />
        {/* Szyjki łączące rączkę z górną krawędzią walizki */}
        <div className="absolute -bottom-2 left-2 h-3 w-3 rounded-sm bg-mauve-900" />
        <div className="absolute -bottom-2 right-2 h-3 w-3 rounded-sm bg-mauve-900" />
      </div>

      {/* === Korpus walizki === */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-mauve-900 bg-hero-gradient bg-[length:200%_200%] p-10 text-white shadow-glow animate-gradient-shift"
        style={{ boxShadow: '0 20px 50px -10px rgba(34, 30, 54, 0.8), inset 0 0 0 1px rgba(255,255,255,0.06)' }}
      >
        {/* Pływające kolorowe blob-y */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-accent-500/30 blur-3xl animate-blob" />
        <div
          className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl animate-blob"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="pointer-events-none absolute right-1/3 top-1/3 h-40 w-40 rounded-full bg-mauve-300/20 blur-2xl animate-blob"
          style={{ animationDelay: '8s' }}
        />

        {/* Subtelna siatka kropek */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* === Klamry pod uchwytem === */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 flex -translate-x-1/2 gap-24">
          <div className="h-2.5 w-8 rounded-sm bg-gradient-to-b from-mauve-100 via-mauve-300 to-mauve-500 shadow-md ring-1 ring-mauve-900/40" />
          <div className="h-2.5 w-8 rounded-sm bg-gradient-to-b from-mauve-100 via-mauve-300 to-mauve-500 shadow-md ring-1 ring-mauve-900/40" />
        </div>

        {/* === Nity w 4 rogach === */}
        <div className="pointer-events-none absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-mauve-100/80 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)]" />
        <div className="pointer-events-none absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-mauve-100/80 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)]" />
        <div className="pointer-events-none absolute left-3 bottom-3 h-2.5 w-2.5 rounded-full bg-mauve-100/80 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)]" />
        <div className="pointer-events-none absolute right-3 bottom-3 h-2.5 w-2.5 rounded-full bg-mauve-100/80 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)]" />

        {/* === Naklejki podróżnicze === */}
        <div className="pointer-events-none absolute right-6 top-6 -rotate-12">
          <div className="rounded-full border-2 border-dashed border-amber-300/60 bg-amber-200/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-200">
            ✈ Travel
          </div>
        </div>

        <div className="relative z-10 pt-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur">
            <Compass className="h-4 w-4" strokeWidth={2.4} />
            TriPla · planner wycieczek
          </div>
          <h2 className="mb-3 text-4xl font-extrabold leading-[1.1] tracking-tight">
            {title}
          </h2>
          <p className="max-w-md text-base text-white/80">{subtitle}</p>

          {/* Mini "preview" karty z opcji */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={
                    'rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md ' +
                    f.rotate +
                    ' animate-float'
                  }
                  style={{
                    animationDelay: f.delay,
                    animationName:
                      f.rotate.includes('-rotate') ? 'float' : 'float-2',
                  }}
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    {f.title}
                  </div>
                  <div className="text-sm font-medium leading-tight">{f.body}</div>
                </div>
              );
            })}
          </div>

          {/* Stopka z liczbami */}
          <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-6 text-sm">
            <div>
              <div className="text-2xl font-extrabold">∞</div>
              <div className="text-white/60">wycieczek na koncie</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <div className="text-2xl font-extrabold">0 zł</div>
              <div className="text-white/60">za korzystanie</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <div className="text-2xl font-extrabold">3 sek</div>
              <div className="text-white/60">do startu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
