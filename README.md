# TriPla – Frontend

Webowy interfejs aplikacji **TriPla** – wspólnego planowania podróży.
Komunikuje się z REST API z [`TriPla-Backend`](../TriPla-Backend) i pozwala
zalogowanym użytkownikom planować wyjazdy: dodawać atrakcje, zarządzać
wydatkami z automatycznym rozliczeniem, prowadzić dyskusje w komentarzach
oraz oglądać kalendarz wszystkich swoich podróży.

---

## Spis treści

1. [Stack technologiczny](#stack-technologiczny)
2. [Funkcjonalności](#funkcjonalności)
3. [Architektura kodu](#architektura-kodu)
4. [Uruchomienie lokalne](#uruchomienie-lokalne)
5. [Testy](#testy)
6. [Docker i CI/CD](#docker-i-cicd)
7. [Konfiguracja](#konfiguracja)

---

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Bundler | **Vite 6** |
| Framework | **React 18** + **TypeScript** (strict) |
| Routing | **React Router v6** |
| Stan serwera | **TanStack Query v5** (cache, invalidation, retry) |
| HTTP | **Axios** (interceptor JWT + auto-logout na 401) |
| Stan klienta | **Zustand** + `persist` (auth + theme) |
| Formularze | **React Hook Form** + **Zod** (walidacja) |
| Style | **Tailwind CSS 3** z customową paletą `mauve` (#6f6399) |
| Ikony | **lucide-react** |
| Daty | **date-fns** |
| Testy | **Vitest** + **React Testing Library** + **jsdom** |
| Konteneryzacja | **Docker** (multi-stage Node → nginx) |
| CI/CD | **GitHub Actions** + **CodeQL** + **Dependabot** + **Trivy** |

---

## Funkcjonalności

### Landing i auth

- Marketingowy **landing page** z animowanym gradientem i kolażem mockupów
  podróżniczych – widoczny dla niezalogowanych.
- Logowanie i rejestracja w split-screenie z **panelem hero w kształcie
  walizki** (uchwyt, klamry, nity, naklejka travel) – sekcja brand'owa
  z animowanymi blob-ami.
- Komunikaty błędów tłumaczone na czytelne polskie zdania
  (np. 401 → „Niepoprawny email lub hasło", brak sieci → „Brak połączenia
  z serwerem").

### Wycieczki

- **Lista wycieczek** – karty z kolorowymi gradient-banner-ami
  (deterministyczny kolor po `tripId`), licznikiem uczestników, hover-lift.
- **Tworzenie / edycja / usuwanie** wycieczki z walidacją zakresu dat.
  Owner może usunąć, Editor+ może edytować nazwę / opis / daty.
- **Szczegóły wycieczki** z hero-banner-em i pięcioma zakładkami:

  | Zakładka | Co tam jest |
  |---|---|
  | **Atrakcje** | Lista z opcjonalnym adresem i datą; inline edit + delete (Editor+). |
  | **Uczestnicy** | Imię/email + badge roli; zaproszenie po e-mailu (Editor+); dropdown zmiany roli (tylko Owner); usuwanie (Editor+). |
  | **Wydatki** | Lista z czytelnym wyświetleniem podziału („po równo po X PLN: Alice, Bob, Carol" / pełna lista przy nierównym), filtr „Pokaż rozliczone", bulk „Rozlicz wszystkie", inline edit + delete (autor-płatnik). U góry **podsumowanie rozliczeń** – uproszczone transfery „kto komu ile" per waluta z deduplikacją wzajemnych długów. |
  | **Komentarze** | Top-level + jednopoziomowe odpowiedzi z wcięciem; edit + delete tylko autor. |
  | **Historia** | Audit log z czytelnymi polskimi etykietami zdarzeń + diff zmienionych pól dla update'ów (`pole: 'stare' → 'nowe'`). |

### Kalendarz

- Widok miesięczny 7 × 5–6 z wycieczkami jako kolorowe paski rozciągające się
  przez kolejne dni. Klik w pasek przenosi do detali wycieczki.
- Nawigacja prev / next / dziś, zaznaczenie aktualnego dnia.

### Tryb ciemny

- Przełącznik słońce/księżyc w nawigacji (Zustand + `localStorage`).
- Pierwsze wejście – respektowana preferencja systemowa
  (`prefers-color-scheme`).
- Wszystkie ekrany przygotowane na oba tryby z dedykowaną paletą i mauve
  jako kolor akcentu.

### UX

- **Optimistic refetch** przez TanStack Query – po dodaniu / edycji /
  usunięciu lista odświeża się automatycznie.
- **Skeleton loadery** zamiast „Ładowanie…".
- **ErrorBoundary** keyed po `pathname` – wyjątek w renderze pokazuje
  ładny komunikat zamiast białego ekranu i resetuje się przy zmianie trasy.
- **A11y** – `aria-pressed` na togglach, `aria-label` na ikonowych
  przyciskach, kontrast w obu trybach.

---

## Architektura kodu

```
src/
├── api/            ← klient axios + moduły per-zasób
│   ├── client.ts             ← interceptor JWT + auto-logout na 401
│   ├── auth.ts
│   ├── trips.ts
│   ├── attractions.ts
│   ├── expenses.ts
│   ├── comments.ts
│   ├── participants.ts
│   └── history.ts
├── components/     ← komponenty współdzielone
│   ├── Layout.tsx            ← header z nawigacją + ThemeToggle
│   ├── ProtectedRoute.tsx
│   ├── ErrorBoundary.tsx
│   ├── ThemeToggle.tsx
│   └── AuthHero.tsx          ← walizka na auth pages
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── TripsListPage.tsx
│   ├── CreateTripPage.tsx
│   ├── TripDetailsPage.tsx
│   ├── CalendarPage.tsx
│   ├── NotFoundPage.tsx
│   └── TripTabs/             ← zawartość zakładek + helpery
│       ├── TripHeader.tsx
│       ├── AttractionsTab.tsx
│       ├── ParticipantsTab.tsx
│       ├── ExpensesTab.tsx
│       ├── ExpenseForm.tsx           ← reuse dla create/edit
│       ├── SettlementSummary.tsx
│       ├── CommentsTab.tsx
│       └── HistoryTab.tsx
├── store/
│   ├── auth.ts               ← Zustand + persist (token + userId + email)
│   └── theme.ts              ← Zustand + persist + useApplyTheme()
├── types/index.ts            ← DTO 1:1 z backendem (z enumami)
├── utils/
│   ├── settlement.ts         ← computeSettlements + equalSplitAmounts
│   ├── permissions.ts        ← getMyRole + canEditTripResources + isTripOwner
│   ├── user.ts               ← formatUser / formatUserShort / formatUserWithName
│   └── errors.ts             ← getApiErrorMessage
├── App.tsx
├── main.tsx
└── index.css                 ← Tailwind + komponenty (`.card`, `.btn-primary`, `.input`)
```

### Permissions na froncie

`utils/permissions.ts` udostępnia trzy helpery na podstawie listy
uczestników i id zalogowanego użytkownika:

- `getMyRole(participants, userId)` – zwraca `ParticipantRole | null`.
- `canEditTripResources(role)` – `true` dla Editora i Ownera.
- `isTripOwner(role)` – `true` tylko dla Organizera.

Komponenty pokazują przyciski tylko gdy odpowiednia rola się zgadza.
Backend i tak weryfikuje uprawnienia przy każdej mutacji – frontend chowa
przyciski czysto kosmetycznie.

### Algorytm rozliczeń

`utils/settlement.ts → computeSettlements(expenses)`:

1. Pomiń wydatki rozliczone (`isSettled`) i te bez splitów (= prywatne).
2. Dla każdej waluty osobno – policz **bilans netto** każdego użytkownika
   (zapłacone − należne).
3. Greedy match – największy wierzyciel ↔ największy dłużnik, kasuj
   po `min(|balance|)` aż wszyscy są na zerze.
4. Zwróć listę `{ from, to, amount, currency }` – minimalna liczba
   przelewów żeby zamknąć długi.

Funkcja w pełni pokryta testami (Vitest, dwóch userów, trzech userów
z wzajemnymi długami, multi-currency).

---

## Uruchomienie lokalne

### Wymagania

- **Node.js 20+**
- Działające API z [`TriPla-Backend`](../TriPla-Backend) na
  `http://localhost:5186`

### Pierwsze uruchomienie

```bash
npm install
npm run dev
```

Aplikacja otworzy się pod `http://localhost:5173`.

Vite proxy-uje `/api/*` → `http://localhost:5186` (konfiguracja w
`vite.config.ts`), więc nie ma problemów z CORS w dev.

### Konta demo (zasiane przez backend)

Hasło dla wszystkich: **`Password123!`**

- `alice@example.com`
- `bob@example.com`
- `carol@example.com`

---

## Testy

```bash
npm test            # jeden przebieg (CI mode)
npm run test:watch  # tryb watch z HMR Vitest
```

**31 testów** pokrywających:

- **`utils/settlement`** – `equalSplitAmounts` (drift cents, suma == total),
  `splitsAreEqual` (z tolerancją grosza), `computeSettlements`
  (puste, settled-skip, dwóch userów, wzajemne długi, multi-currency).
- **`utils/user`** – `formatUser*` w różnych kombinacjach pól.
- **`utils/permissions`** – wyznaczanie roli, sprawdzanie uprawnień.
- **`pages/TripTabs/SettlementSummary`** (RTL) – render listy transferów,
  pomijanie rozliczonych, komunikat „wszystko się zgadza".

---

## Docker i CI/CD

### Lokalny build obrazu

```bash
docker build -t tripla-frontend:local .
docker run -p 8080:80 -e API_URL=http://host.docker.internal:5186 tripla-frontend:local
```

Multi-stage Dockerfile:

1. **Build** – `node:20-alpine` → `npm ci` → `npm run build`.
2. **Runtime** – `nginx:1.27-alpine` z customowym `nginx.conf`:
   - SPA fallback (`try_files $uri $uri/ /index.html`)
   - Proxy `/api/` → `${API_URL}/api/` (envsubst z env var, default
     `http://api:8080`)
   - Health check pod `/healthz`
   - Cache statyki przez 1 rok dla `*.css/js/woff2/...`
   - Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
     `Referrer-Policy`)

### Pełny stack lokalnie (artefakty z CI)

```bash
# Pobierz tripla-frontend-image-<sha>.tar z GitHub Actions
docker load -i tripla-frontend.tar
docker compose -f ../TriPla-Backend/docker-compose.prod.yml up
# → http://localhost:8080
```

### GitHub Actions (`.github/workflows/`)

- **`ci.yml`** – `npm ci` → `tsc -b` → `vitest run` → `vite build` →
  upload `dist/` jako artefakt → docker build (z cache GHA) →
  **Trivy CVE scan** → `docker save` + upload obrazu jako `.tar` artefakt
  + osobny job `npm audit --audit-level=high`.
- **`codeql.yml`** – statyczna analiza JS/TS, schedule co wtorek.
- **Concurrency** – nowy push na ten sam branch anuluje poprzedni run.

### Dependabot

`.github/dependabot.yml` – tygodniowe PR-y dla npm, GitHub Actions
i bazowego Docker image. Aktualizacje pogrupowane: `react*`, `@tanstack/*`,
`testing` (vitest + RTL), `tooling` (vite/typescript/tailwind).

---

## Konfiguracja

### Skrypty npm

| Skrypt | Opis |
|---|---|
| `npm run dev` | Vite dev-server z HMR pod `http://localhost:5173` |
| `npm run build` | TypeScript compile (`tsc -b`) + produkcyjny build do `dist/` |
| `npm run preview` | Serwowanie wybudowanego `dist/` lokalnie |
| `npm run lint` | ESLint |
| `npm test` | Vitest – jeden przebieg |
| `npm run test:watch` | Vitest w trybie watch |

### Zmienne środowiskowe

`.env` (kopiuj z `.env.example`):

```
VITE_API_BASE_URL=         # puste → używany proxy /api z vite.config.ts
                           # dla innej domeny / produkcji wpisz pełny URL
```

W obrazie Docker proxy `/api` jest robione przez nginx, kontrolowane
zmienną `API_URL` (default `http://api:8080`):

```bash
docker run -p 8080:80 -e API_URL=https://api.example.com tripla-frontend:local
```

### Tailwind – paleta

Projekt ma własne kolory:

- **`brand`** (50–900) – niebieski, główny akcent
- **`accent`** (50–700) – fuchsia, drugi akcent
- **`mauve`** (50–900, default `#6f6399`) – stonowany fiolet używany
  w gradientach hero i jako akcent w trybie ciemnym

Dodatkowo gradient `bg-brand-gradient` (niebieski → mauve → fuchsia),
shadow `shadow-glow` i animacje `float` / `gradient-shift` / `blob`
służące do dekoracyjnych elementów landingu.
