import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Bookmark {
  id: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  source: string;
  savedAt: Date;
  notes?: string;
}

const STORAGE_KEY = 'bookmarks';

// Helper to parse stored bookmarks with Date conversion
function loadBookmarksFromStorage(): Bookmark[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((b: Bookmark) => ({
      ...b,
      savedAt: new Date(b.savedAt)
    }));
  } catch (e) {
    console.error('Failed to parse bookmarks', e);
    return [];
  }
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarksFromStorage);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    const syncBookmarks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const cloudBookmarks: Bookmark[] = data.map(b => ({
            id: b.id,
            articleId: b.article_id,
            articleTitle: b.article_title,
            articleUrl: b.article_url,
            source: b.source,
            savedAt: new Date(b.created_at),
            notes: b.notes
          }));

          // Merge local and cloud bookmarks (cloud takes precedence)
          const localBookmarks = loadBookmarksFromStorage();
          const cloudIds = new Set(cloudBookmarks.map(b => b.articleId));
          const uniqueLocal = localBookmarks.filter(b => !cloudIds.has(b.articleId));

          // Upload unique local bookmarks to cloud
          for (const local of uniqueLocal) {
            await supabase.from('bookmarks').insert({
              user_id: user.id,
              article_id: local.articleId,
              article_title: local.articleTitle,
              article_url: local.articleUrl,
              source: local.source,
              notes: local.notes
            });
          }

          setBookmarks([...cloudBookmarks, ...uniqueLocal].sort(
            (a, b) => b.savedAt.getTime() - a.savedAt.getTime()
          ));
        }
      } catch (e) {
        console.error('Failed to sync bookmarks', e);
      } finally {
        setIsLoading(false);
      }
    };

    syncBookmarks();
  }, [user]);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback(async (
    articleId: string,
    articleTitle: string,
    articleUrl: string,
    source: string,
    notes?: string
  ) => {
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      articleId,
      articleTitle,
      articleUrl,
      source,
      savedAt: new Date(),
      notes
    };

    setBookmarks(prev => [newBookmark, ...prev]);

    // Sync to Supabase if logged in
    if (user && isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('bookmarks').insert({
          user_id: user.id,
          article_id: articleId,
          article_title: articleTitle,
          article_url: articleUrl,
          source,
          notes
        }).select().single();

        if (data) {
          setBookmarks(prev => prev.map(b =>
            b.articleId === articleId ? { ...b, id: data.id } : b
          ));
        }
      } catch (e) {
        console.error('Failed to sync bookmark to cloud', e);
      }
    }
  }, [user]);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));

    // Remove from Supabase if logged in
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('bookmarks').delete().eq('id', bookmarkId);
      } catch (e) {
        console.error('Failed to remove bookmark from cloud', e);
      }
    }
  }, [user]);

  const isBookmarked = useCallback((articleId: string): boolean => {
    return bookmarks.some(b => b.articleId === articleId);
  }, [bookmarks]);

  const updateNotes = useCallback(async (bookmarkId: string, notes: string) => {
    setBookmarks(prev =>
      prev.map(b =>
        b.id === bookmarkId ? { ...b, notes } : b
      )
    );

    // Update in Supabase if logged in
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('bookmarks').update({ notes }).eq('id', bookmarkId);
      } catch (e) {
        console.error('Failed to update bookmark notes in cloud', e);
      }
    }
  }, [user]);

  const clearAllBookmarks = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setBookmarks([]);

    // Clear from Supabase if logged in
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('bookmarks').delete().eq('user_id', user.id);
      } catch (e) {
        console.error('Failed to clear bookmarks from cloud', e);
      }
    }
  }, [user]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateNotes,
    clearAllBookmarks,
    isLoading
  };
}
