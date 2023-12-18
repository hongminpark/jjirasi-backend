import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default supabase;
