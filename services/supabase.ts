import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://xyhibqpvddsplkvnvlis.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aGlicXB2ZGRzcGxrdm52bGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDgxMTAsImV4cCI6MjA4NzkyNDExMH0.Fgtm_Br0fCGmPXwBOQk_oc6e0BwK6vD3kt6W1WKZP54".trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
