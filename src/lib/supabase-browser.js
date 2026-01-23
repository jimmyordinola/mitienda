'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowser = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export async function signInWithGoogle() {
  const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
}

export async function signInWithFacebook() {
  const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabaseBrowser.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data: { session }, error } = await supabaseBrowser.auth.getSession();
  return { session, error };
}

export async function getUser() {
  const { data: { user }, error } = await supabaseBrowser.auth.getUser();
  return { user, error };
}
