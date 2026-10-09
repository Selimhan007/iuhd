CREATE TYPE public.app_role AS ENUM ('student','teacher','admin','superadmin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('announcement','notice','notification','exam','assignment','grade','material','lecture','event')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 5000),
  sender_kind text NOT NULL CHECK (sender_kind IN ('university','department','dean','teacher')),
  sender_name text NOT NULL CHECK (char_length(sender_name) BETWEEN 1 AND 200),
  course_id text,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.publications TO authenticated;
GRANT ALL ON public.publications TO service_role;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read" ON public.publications FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin publish" ON public.publications FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND sender_kind IN ('university','department','dean')
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin')));
CREATE POLICY "teacher publish" ON public.publications FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND sender_kind = 'teacher' AND public.has_role(auth.uid(),'teacher'));
CREATE POLICY "delete own or admin" ON public.publications FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
ALTER TABLE public.publications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.publications;

CREATE TABLE public.admin_lists (
  resource text PRIMARY KEY,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.admin_lists TO authenticated;
GRANT ALL ON public.admin_lists TO service_role;
ALTER TABLE public.admin_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read lists" ON public.admin_lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin insert lists" ON public.admin_lists FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update lists" ON public.admin_lists FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
ALTER TABLE public.admin_lists REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_lists;