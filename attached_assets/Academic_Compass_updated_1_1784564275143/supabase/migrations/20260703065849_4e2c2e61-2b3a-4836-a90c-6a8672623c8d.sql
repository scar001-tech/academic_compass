
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin','principal','hod','class_teacher','subject_teacher');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authed" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + first-user becomes admin+principal
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  SELECT count(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'), (NEW.id, 'principal');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'subject_teacher');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Mark entries (remote authoritative store; client id kept for mapping)
CREATE TABLE public.mark_entries (
  id TEXT PRIMARY KEY,
  curriculum_id TEXT NOT NULL,
  sheet_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  score NUMERIC,
  override_grade TEXT,
  updated_by UUID REFERENCES auth.users(id),
  device_name TEXT,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mark_entries TO authenticated;
GRANT ALL ON public.mark_entries TO service_role;
ALTER TABLE public.mark_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read marks" ON public.mark_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authed write marks" ON public.mark_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authed update marks" ON public.mark_entries FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER touch_mark_entries BEFORE UPDATE ON public.mark_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.mark_entries;
ALTER TABLE public.mark_entries REPLICA IDENTITY FULL;

-- Timetable slots
CREATE TABLE public.timetable_slots (
  id TEXT PRIMARY KEY,
  curriculum_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  stream_id TEXT,
  day_of_week SMALLINT NOT NULL, -- 1=Mon..5=Fri
  period SMALLINT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  subject_id TEXT,
  teacher_id TEXT,
  room TEXT,
  version INT NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id),
  device_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_slots TO authenticated;
GRANT ALL ON public.timetable_slots TO service_role;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
-- All authed can read
CREATE POLICY "Authed read timetable" ON public.timetable_slots FOR SELECT TO authenticated USING (true);
-- Only principal/hod/admin can write
CREATE POLICY "HOD/Principal insert timetable" ON public.timetable_slots FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "HOD/Principal update timetable" ON public.timetable_slots FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "HOD/Principal delete timetable" ON public.timetable_slots FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'principal') OR public.has_role(auth.uid(),'hod') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER touch_timetable BEFORE UPDATE ON public.timetable_slots FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_slots;
ALTER TABLE public.timetable_slots REPLICA IDENTITY FULL;

-- Persisted conflicts (mirrors client)
CREATE TABLE public.sync_conflicts (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL, -- 'mark' | 'timetable' etc
  entity_id TEXT NOT NULL,
  field TEXT NOT NULL,
  server_value TEXT,
  incoming_value TEXT,
  incoming_by UUID REFERENCES auth.users(id),
  incoming_device TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolution TEXT,
  custom_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_conflicts TO authenticated;
GRANT ALL ON public.sync_conflicts TO service_role;
ALTER TABLE public.sync_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read conflicts" ON public.sync_conflicts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authed write conflicts" ON public.sync_conflicts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authed update conflicts" ON public.sync_conflicts FOR UPDATE TO authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_conflicts;
