import { createClient } from '@supabase/supabase-js';

// Supabase configuration - reads from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_PROJECT'));

// Create client (will fail gracefully if not configured)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: 'free' | 'premium';
  subscription_status: 'active' | 'canceled' | 'trialing';
  stripe_customer_id?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  article_title: string;
  article_url: string;
  source: string;
  notes?: string;
  created_at: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  article_title: string;
  article_url: string;
  source: string;
  read_at: string;
}

export interface EmailSignup {
  id: string;
  email: string;
  source: string;
  created_at: string;
  subscribed: boolean;
}

// Helper functions for auth
export async function signUp(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Supabase not configured' } };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return { user: null, error: { message: 'Supabase not configured' } };
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Helper functions for database operations
export async function saveEmailSignup(email: string, source: string = 'popup') {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - email signup will use localStorage fallback');
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('email_signups')
      .insert([{ email, source, subscribed: true }])
      .select()
      .single();

    return { data, error };
  } catch (e) {
    return { data: null, error: { message: String(e) } };
  }
}

export async function getUserBookmarks(userId: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function addBookmark(
  userId: string,
  articleId: string,
  articleTitle: string,
  articleUrl: string,
  source: string,
  notes?: string
) {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{
      user_id: userId,
      article_id: articleId,
      article_title: articleTitle,
      article_url: articleUrl,
      source,
      notes,
    }])
    .select()
    .single();

  return { data, error };
}

export async function removeBookmark(bookmarkId: string) {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Supabase not configured' } };
  }
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId);

  return { error };
}

export async function getUserHistory(userId: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', userId)
    .order('read_at', { ascending: false });

  return { data, error };
}

export async function addToHistory(
  userId: string,
  articleId: string,
  articleTitle: string,
  articleUrl: string,
  source: string
) {
  if (!isSupabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase
    .from('reading_history')
    .insert([{
      user_id: userId,
      article_id: articleId,
      article_title: articleTitle,
      article_url: articleUrl,
      source,
    }])
    .select()
    .single();

  return { data, error };
}
