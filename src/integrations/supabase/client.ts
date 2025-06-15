
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://bsyiiwscknexefcsobxq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeWlpd3Nja25leGVmY3NvYnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTM5NzcsImV4cCI6MjA2NTU4OTk3N30.b7nLh4QD8ctsnokZXAfEL-cigcZAZiXb_d_NdQxd41o",
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
