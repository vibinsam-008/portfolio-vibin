import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PortfolioData } from '../types/portfolio.ts';
import { cloudDatabaseConfig } from '../config/cloudDatabase.ts';

export const SUPABASE_SQL_SETUP = `-- Run this in your Supabase Dashboard -> SQL Editor:

create table if not exists portfolio (
  id text primary key default 'primary',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table portfolio enable row level security;

-- Policy 1: Allow public visitors to read the portfolio
drop policy if exists "Public portfolio viewable by everyone" on portfolio;
create policy "Public portfolio viewable by everyone" 
  on portfolio for select 
  using (true);

-- Policy 2: Allow portfolio updates and inserts (upsert)
drop policy if exists "Allow portfolio write" on portfolio;
create policy "Allow portfolio write" 
  on portfolio for all 
  using (true)
  with check (true);
`;

export function getSupabaseCredentials(): { url: string; key: string } | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const configUrl = cloudDatabaseConfig.supabaseUrl;
  const configKey = cloudDatabaseConfig.supabaseAnonKey;
  const localUrl = localStorage.getItem('vibin_supabase_url');
  const localKey = localStorage.getItem('vibin_supabase_key');

  const url = (envUrl || configUrl || localUrl || '').trim();
  const key = (envKey || configKey || localKey || '').trim();

  if (url && key && url.startsWith('http')) {
    return { url, key };
  }
  return null;
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds) return null;

  if (cachedClient && lastUsedUrl === creds.url && lastUsedKey === creds.key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(creds.url, creds.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    lastUsedUrl = creds.url;
    lastUsedKey = creds.key;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseCredentials());
}

export async function fetchFromSupabase(): Promise<PortfolioData | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('data')
      .eq('id', 'primary')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }
    return data?.data as PortfolioData | null;
  } catch (err) {
    console.warn('Supabase exception:', err);
    return null;
  }
}

export async function saveToSupabase(portfolioData: PortfolioData): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { error } = await supabase
      .from('portfolio')
      .upsert({
        id: 'primary',
        data: portfolioData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase upsert exception:', err);
    return { success: false, error: err.message };
  }
}
