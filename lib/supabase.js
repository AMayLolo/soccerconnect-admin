// lib/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // 👈 MUST be first

export const SUPABASE_URL = 'https://fwmakeazbshawabsqeea.supabase.co'; // no trailing slash
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bWFrZWF6YnNoYXdhYnNxZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDg5NDEsImV4cCI6MjA3NjQ4NDk0MX0.TtCa7LLNz6xXtjFg7ZHWJd_xAHL4EBi8AdolrBfQGRE'; // 👈 no < >

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
