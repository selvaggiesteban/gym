import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urrshifuwrsnumhjnsju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycnNoaWZ1d3JzbnVtaGpuc2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQyNjMsImV4cCI6MjA2ODY3MDI2M30.QI523k6LRJUMaTslVbq-zxds5Df6K99t2PoJvORMBwo';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
