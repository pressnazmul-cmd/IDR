
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration for the user's specific project: IOM DELIVERY REPORT
const DEFAULT_URL = 'https://ldwxltpzaqcddblnnrlb.supabase.co';
const DEFAULT_KEY = 'sb_publishable_gVXmFtLsUf9EYG8dZPOg7w_gjrdUQFH';

const isValidUrl = (url: string) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  } catch {
    return false;
  }
};

export const getSupabaseConfig = () => {
  let url = localStorage.getItem('supabase_url') || DEFAULT_URL;
  // Fallback to default if stored URL is corrupted or invalid
  if (!isValidUrl(url)) {
    url = DEFAULT_URL;
  }
  
  // Use stored key or fallback to the provided project key
  const key = localStorage.getItem('supabase_anon_key') || DEFAULT_KEY;
  
  return { url, key };
};

export const setSupabaseConfig = (url: string, key: string) => {
  if (isValidUrl(url)) {
    localStorage.setItem('supabase_url', url);
  }
  localStorage.setItem('supabase_anon_key', key);
  // Reset the singleton so it regenerates on next call
  clientInstance = null;
};

let clientInstance: SupabaseClient | null = null;
let lastUsedKey: string | null = null;
let lastUsedUrl: string | null = null;

export const getSupabase = (): SupabaseClient => {
  const { url, key } = getSupabaseConfig();
  
  // If no instance exists or config changed, create a new client
  if (!clientInstance || key !== lastUsedKey || url !== lastUsedUrl) {
    clientInstance = createClient(url, key || 'placeholder-key-for-init');
    lastUsedKey = key;
    lastUsedUrl = url;
  }
  return clientInstance;
};

// Singleton export
export const supabase = getSupabase();
