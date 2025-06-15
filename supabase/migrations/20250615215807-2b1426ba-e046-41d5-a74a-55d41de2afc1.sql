
-- Quitar la FK incorrecta que apunta a public.users
ALTER TABLE public.exercises 
  DROP CONSTRAINT IF EXISTS exercises_user_id_fkey;

-- Agregar la FK correcta a auth.users(id)
ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
