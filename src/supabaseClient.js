import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://raaiqgcymvksbzundnwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYWlxZ2N5bXZrc2J6dW5kbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDMwNzYsImV4cCI6MjA5MzQ3OTA3Nn0.lXsV-qP_iw8CoxI8MrfcDsP-_hyll8D-kVDbmFOIbSw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
