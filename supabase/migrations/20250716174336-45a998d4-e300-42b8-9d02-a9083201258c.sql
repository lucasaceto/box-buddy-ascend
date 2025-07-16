-- Create daily_wods table for WOD registrations
CREATE TABLE public.daily_wods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    workout_id UUID,
    result_type TEXT NOT NULL,
    score TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Foreign key constraints
    CONSTRAINT daily_wods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT daily_wods_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.daily_wods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_wods
CREATE POLICY "Users can view their own WODs" 
ON public.daily_wods 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own WODs" 
ON public.daily_wods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WODs" 
ON public.daily_wods 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WODs" 
ON public.daily_wods 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX idx_daily_wods_user_id_date ON public.daily_wods(user_id, date DESC);