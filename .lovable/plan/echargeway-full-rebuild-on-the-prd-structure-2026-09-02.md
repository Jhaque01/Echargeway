# eChargeWay — Full Rebuild on the PRD Structure

A complete rebuild of the app as a multi-page, routed EV charging platform following the PRD, branded **eChargeWay** (not PowerLoop), with email + password auth (plus Google), and a real database behind every screen. Built in 5 reviewable phases.

Design direction: the PRD's premium dark EV look — near-black background, electric green accent, serif display headings for major titles, sans-serif UI text, thin borders, sparing green glow. Logo: the uploaded green lightning-bolt-in-circle mark, used in headers, auth cards, and the favicon.

---

## Phase 1 — Design system, layout, navigation, all page shells

- Rework the theme tokens: near-black `#030706` background, dark surfaces, `#7CFF3A` electric green primary, off-white / muted-gray text, red danger, subtle borders, glass card surfaces. All values as semantic tokens, no hardcoded colors in components.
- Typography: serif display face for headings, modern sans for UI.
- Reusable component library: Navbar, MobileDrawer, BottomTabBar, Footer, Button variants, inputs, Card, StatsCard, StationCard, SessionCard, ProgressRing, BatteryIndicator, ConfirmationModal, Toast, LoadingSpinner, EmptyState, ErrorState.
- Routing for every PRD page: `/home`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/dashboard`, `/stations`, `/station/:id`, `/scan`, `/charging/start/:chargerId`, `/charging/active/:sessionId`, `/charging/summary/:sessionId`, `/payment/:sessionId`, `/payment/success`, `/history`, `/history/:id`, `/profile`, `/vehicles`, `/favorites`, `/notifications`, `/support`, `/about`, `/privacy`, `/terms`.
- Landing page: hero ("The Future of EV Charging"), three feature cards (Ultra-Fast Charging, Smart Location with a Navigate action, Seamless UPI), investor CTA with modal, footer links.
- Navigation rules: desktop full navbar; mobile hamburger drawer plus a fixed bottom tab bar (Dashboard, Stations, Scan, Profile) on protected pages. A back button appears only in child/detail views, never on root views.
- Mobile-first responsive layouts (390px priority), with genuinely different desktop layouts — wider containers, multi-column grids, persistent nav, larger map.

## Phase 2 — Auth and database

- Email + password sign-up and sign-in, Google sign-in, forgot-password email with a working `/reset-password` page, logout, protected routes with a session guard.
- New tables (all with row-level security scoped to the signed-in user, plus public read where appropriate): `profiles`, `vehicles`, `charging_stations`, `chargers`, `charging_sessions`, `payments`, `notifications`, `favorites`, `station_reviews`, `reservations`.
- Seed realistic stations and chargers (name, address, coordinates, hours, amenities, rating; per-charger code, connector, power, price, status).
- New users land in a 4-step onboarding wizard (vehicle, battery capacity, connector, preferred charge limit) that saves their first vehicle.
- Dashboard: greeting, current vehicle and battery, nearest station, quick actions.
- Existing charging history rows stay in place; the new schema is added alongside so nothing currently stored is lost.

## Phase 3 — Stations, chargers, live charging

- Find Stations: search, live Leaflet map with markers colored by availability, distance sorting from device location, favorites pinned to the top, filters for distance, power output, connector, price, and availability.
- Station detail: address, distance, hours, amenities, rating; charger list with status colors (available / occupied / reserved / offline / faulted); reviews section with star rating and comments; a cost estimator using the selected vehicle's battery capacity and current charge; a Reserve button that locks a charger for 15 minutes and sets its status to reserved (auto-expiring).
- QR scan page with camera scanning and manual charger-ID fallback.
- Start-charging page: target-battery slider with estimated energy, time, and cost, then a confirm modal.
- Active charging screen matching the reference: large animated progress ring, "FAST CHARGING" label, remaining / power / est. cost cards, red Stop Charging button, live simulation ticking battery %, energy, and cost while persisting session state. On completion or stop, a stop-confirmation modal then the summary page.
- Favorites tab listing saved stations with a quick path into a session.

## Phase 4 — Payments and history

- Payment page with a cost breakdown (energy, platform fee, taxes, total), UPI as the primary method with QR and app options, card/wallet placeholders, and a service layer shaped so a real gateway can drop in later.
- Payment success page with amount, transaction ID, method, and receipt download.
- History page: monthly spend with trend, carbon saved (energy × 0.71 kg), total energy, average cost/kWh, session cards, working paginated Load More, and a bar chart of monthly energy consumption and cost/savings.
- Transaction detail page with full session breakdown, invoice download, and support/navigate actions.

## Phase 5 — Polish

- Notifications page and in-app alerts for session start, 100% / session stop, payment success, and a favorite station's charger becoming available. Delivered as in-app notifications plus browser push where the user grants permission (true native push needs a packaged app; noted rather than faked).
- Native WebView tweaks: safe-area insets for notch and bottom bar, `overscroll-behavior: none`, `select-none` on interactive controls, Radix Select instead of native `<select>` in Vehicles, Delete Account with a confirmation dialog in Profile, route slide transitions, pull-to-refresh on Stations and History.
- Loading, empty, and error states on every data-driven page; toasts for all actions; no dead buttons or blank routes.
- Profile, Vehicles (add/edit/delete), Support, About, Privacy, Terms filled with real content.

---

## Technical notes

- React + TypeScript + Vite + Tailwind + shadcn/ui + Lucide, Leaflet for maps, Lovable Cloud for auth, database, and storage. Existing single-page `src/components/pl/*` code is replaced by a structured `src/pages` + `src/components` + `src/services` layout; reusable pieces (station math, geolocation, UPI helpers) are carried over.
- Charging simulation runs in a hook with a timer, writing session progress to the database so a refresh resumes the session.
- Reservations expire by timestamp check, so a stale reservation never blocks a charger permanently.
- Automatic session-summary emails via Gmail are **not** in this plan — they need a connected Gmail account and a scheduled backend job; I'll propose that separately once the core app is running.

## Out of scope for now

Real OCPP charger telemetry, live production payments, real push notification delivery through app stores, booking beyond the 15-minute hold, and route planning.
