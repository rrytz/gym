import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://raaiqgcymvksbzundnwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYWlxZ2N5bXZrc2J6dW5kbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDMwNzYsImV4cCI6MjA5MzQ3OTA3Nn0.lXsV-qP_iw8CoxI8MrfcDsP-_hyll8D-kVDbmFOIbSw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session to localStorage so page refreshes don't log the user out
    persistSession: true,
    // Automatically refresh tokens in the background
    autoRefreshToken: true,
    // Detect session from URL (needed for magic links / email confirm redirects)
    detectSessionInUrl: true,
  },
  global: {
    // Give up on requests faster to avoid long hangs if Supabase is paused
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeout));
    },
  },
});
