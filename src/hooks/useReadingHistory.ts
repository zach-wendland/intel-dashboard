import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ReadingHistoryItem {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  source: string;
  readAt: Date;
}

const MAX_HISTORY_ITEMS = 100;
const STORAGE_KEY = 'reading_history';

// Helper to parse stored history with Date conversion
function loadHistoryFromStorage(): ReadingHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((item: ReadingHistoryItem) => ({
      ...item,
      readAt: new Date(item.readAt)
    }));
  } catch (e) {
    console.error('Failed to parse reading history', e);
    return [];
  }
}

export function useReadingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadingHistoryItem[]>(loadHistoryFromStorage);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    const syncHistory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reading_history')
          .select('*')
          .eq('user_id', user.id)
          .order('read_at', { ascending: false })
          .limit(MAX_HISTORY_ITEMS);

        if (error) throw error;

        if (data) {
          const cloudHistory: ReadingHistoryItem[] = data.map(h => ({
            articleId: h.article_id,
            articleTitle: h.article_title,
            articleUrl: h.article_url,
            source: h.source,
            readAt: new Date(h.read_at)
          }));

          // Merge local and cloud history (cloud takes precedence)
          const localHistory = loadHistoryFromStorage();
          const cloudIds = new Set(cloudHistory.map(h => h.articleId));
          const uniqueLocal = localHistory.filter(h => !cloudIds.has(h.articleId));

          // Upload unique local history to cloud (just recent ones)
          for (const local of uniqueLocal.slice(0, 20)) {
            await supabase.from('reading_history').upsert({
              user_id: user.id,
              article_id: local.articleId,
              article_title: local.articleTitle,
              article_url: local.articleUrl,
              source: local.source,
              read_at: local.readAt.toISOString()
            }, { onConflict: 'user_id,article_id' });
          }

          setHistory([...cloudHistory, ...uniqueLocal]
            .sort((a, b) => b.readAt.getTime() - a.readAt.getTime())
            .slice(0, MAX_HISTORY_ITEMS)
          );
        }
      } catch (e) {
        console.error('Failed to sync reading history', e);
      } finally {
        setIsLoading(false);
      }
    };

    syncHistory();
  }, [user]);

  // Save history to localStorage as backup
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback(async (
    articleId: string,
    articleTitle: string,
    articleUrl: string,
    source: string
  ) => {
    setHistory(prev => {
      // Remove existing entry for same article
      const filtered = prev.filter(item => item.articleId !== articleId);

      // Add new entry at the beginning
      const newItem: ReadingHistoryItem = {
        articleId,
        articleTitle,
        articleUrl,
        source,
        readAt: new Date()
      };

      // Keep only the last MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });

    // Sync to Supabase if logged in
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('reading_history').upsert({
          user_id: user.id,
          article_id: articleId,
          article_title: articleTitle,
          article_url: articleUrl,
          source,
          read_at: new Date().toISOString()
        }, { onConflict: 'user_id,article_id' });
      } catch (e) {
        console.error('Failed to sync history to cloud', e);
      }
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);

    // Clear from Supabase if logged in
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('reading_history').delete().eq('user_id', user.id);
      } catch (e) {
        console.error('Failed to clear history from cloud', e);
      }
    }
  }, [user]);

  const hasRead = useCallback((articleId: string): boolean => {
    return history.some(item => item.articleId === articleId);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    hasRead,
    isLoading
  };
}
