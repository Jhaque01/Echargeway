-- Profiles: additive columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_charge_limit integer NOT NULL DEFAULT 80;

-- VEHICLES
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer text NOT NULL DEFAULT '',
  model text NOT NULL,
  year integer,
  battery_capacity numeric NOT NULL DEFAULT 40,
  connector_type text NOT NULL DEFAULT 'CCS2',
  registration_number text DEFAULT '',
  current_battery integer NOT NULL DEFAULT 60,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles own select" ON public.vehicles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "vehicles own insert" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vehicles own update" ON public.vehicles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vehicles own delete" ON public.vehicles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CHARGING STATIONS (public catalogue)
CREATE TABLE IF NOT EXISTS public.charging_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  operating_hours text NOT NULL DEFAULT 'Open 24 hours',
  amenities text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 4.5,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.charging_stations TO anon, authenticated;
GRANT ALL ON public.charging_stations TO service_role;
ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stations public read" ON public.charging_stations FOR SELECT TO anon, authenticated USING (true);

-- CHARGERS
CREATE TABLE IF NOT EXISTS public.chargers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
  charger_code text NOT NULL UNIQUE,
  connector_type text NOT NULL DEFAULT 'CCS2',
  power_kw numeric NOT NULL DEFAULT 60,
  price_per_kwh numeric NOT NULL DEFAULT 18,
  status text NOT NULL DEFAULT 'available',
  reserved_until timestamptz,
  reserved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chargers TO anon, authenticated;
GRANT UPDATE ON public.chargers TO authenticated;
GRANT ALL ON public.chargers TO service_role;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chargers public read" ON public.chargers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "chargers auth update" ON public.chargers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- CHARGING SESSIONS
CREATE TABLE IF NOT EXISTS public.charging_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  station_id uuid REFERENCES public.charging_stations(id) ON DELETE SET NULL,
  charger_id uuid REFERENCES public.chargers(id) ON DELETE SET NULL,
  station_name text NOT NULL DEFAULT '',
  charger_code text NOT NULL DEFAULT '',
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  start_battery integer NOT NULL DEFAULT 40,
  target_battery integer NOT NULL DEFAULT 80,
  end_battery integer,
  energy_consumed numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 0,
  power_kw numeric NOT NULL DEFAULT 60,
  price_per_kwh numeric NOT NULL DEFAULT 18,
  estimated_cost numeric NOT NULL DEFAULT 0,
  final_cost numeric,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.charging_sessions TO authenticated;
GRANT ALL ON public.charging_sessions TO service_role;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions own select" ON public.charging_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sessions own insert" ON public.charging_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions own update" ON public.charging_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions own delete" ON public.charging_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.charging_sessions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  energy_cost numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 10,
  taxes numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'UPI',
  upi_id text,
  transaction_id text NOT NULL,
  payment_status text NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments own select" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "payments own insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments own update" ON public.payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifs own select" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifs own insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifs own update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifs own delete" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, station_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favs own select" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "favs own insert" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favs own delete" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- STATION REVIEWS
CREATE TABLE IF NOT EXISTS public.station_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.station_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.station_reviews TO authenticated;
GRANT ALL ON public.station_reviews TO service_role;
ALTER TABLE public.station_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.station_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews own insert" ON public.station_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews own update" ON public.station_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews own delete" ON public.station_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RESERVATIONS
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charger_id uuid NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reservations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations public read" ON public.reservations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reservations own insert" ON public.reservations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reservations own update" ON public.reservations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reservations own delete" ON public.reservations FOR DELETE TO authenticated USING (auth.uid() = user_id);
