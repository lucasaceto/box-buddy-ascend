
-- 1. Añadir columna user_id a exercises solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='exercises' AND column_name='user_id'
  ) THEN
    ALTER TABLE public.exercises ADD COLUMN user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Activar RLS para todas las tablas mencionadas (por si falta)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prs ENABLE ROW LEVEL SECURITY;

-- 3. users: acceso solo a la propia fila
CREATE POLICY "Cada usuario accede solo a su perfil"
  ON public.users
  USING (id = auth.uid());

-- 4. workouts: CRUD usuario dueño
CREATE POLICY "Ver solo propios entrenamientos"
  ON public.workouts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Insertar solo propios entrenamientos"
  ON public.workouts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Editar solo propios entrenamientos"
  ON public.workouts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Eliminar solo propios entrenamientos"
  ON public.workouts
  FOR DELETE
  USING (user_id = auth.uid());

-- 5. prs: CRUD usuario dueño
CREATE POLICY "Ver PRs propios"
  ON public.prs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Insertar PR propio"
  ON public.prs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Editar PR propio"
  ON public.prs
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Eliminar PR propio"
  ON public.prs
  FOR DELETE
  USING (user_id = auth.uid());

-- 6. user_workouts: CRUD usuario dueño
CREATE POLICY "Ver solo mis registros en user_workouts"
  ON public.user_workouts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Agregar user_workout propio"
  ON public.user_workouts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Editar user_workout propio"
  ON public.user_workouts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Borrar user_workout propio"
  ON public.user_workouts
  FOR DELETE
  USING (user_id = auth.uid());

-- 7. exercises: catálogo global + CRUD sobre propios ejercicios personalizados (user_id)
CREATE POLICY "Seleccionar todos los ejercicios (catálogo global)"
  ON public.exercises
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Insertar ejercicio propio"
  ON public.exercises
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Editar ejercicio propio"
  ON public.exercises
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Borrar ejercicio propio"
  ON public.exercises
  FOR DELETE
  USING (user_id = auth.uid());
