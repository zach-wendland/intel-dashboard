import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface ReadingHistoryItem {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  source: string;
  readAt: Date;
  perspective: 'right' | 'left';
}

const MAX_HISTORY_ITEMS = 100;

function loadHistoryFromStorage(userId: string): ReadingHistoryItem[] {
  const stored = localStorage.getItem(`reading_history_${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: ReadingHistoryItem) => ({
        ...item,
        readAt: new Date(item.readAt)
      }));
    } catch (e) {
      console.error('Failed to parse reading history', e);
    }
  }
  return [];
}

export function useReadingHistory() {
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);

  // Initialize history with lazy loading
  const [history, setHistory] = useState<ReadingHistoryItem[]>(() => {
    if (user) {
      return loadHistoryFromStorage(user.id);
    }
    return [];
  });

  // Sync history when user changes (login/logout)
  useEffect(() => {
    const currentUserId = user?.id ?? null;

    // Only update if user actually changed
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;

      if (currentUserId) {
        const loaded = loadHistoryFromStorage(currentUserId);
        setHistory(loaded);
      } else {
        setHistory([]);
      }
    }
  }, [user]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (user && history.length >= 0) {
      localStorage.setItem(`reading_history_${user.id}`, JSON.stringify(history));
    }
  }, [history, user]);

  const addToHistory = useCallback((
    articleId: string,
    articleTitle: string,
    articleUrl: string,
    source: string,
    perspective: 'right' | 'left'
  ) => {
    if (!user) return;

    setHistory(prev => {
      // Remove existing entry for same article
      const filtered = prev.filter(item => item.articleId !== articleId);

      // Add new entry at the beginning
      const newItem: ReadingHistoryItem = {
        articleId,
        articleTitle,
        articleUrl,
        source,
        readAt: new Date(),
        perspective
      };

      // Keep only the last MAX_HISTORY_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  }, [user]);

  const clearHistory = useCallback(() => {
    if (user) {
      localStorage.removeItem(`reading_history_${user.id}`);
      setHistory([]);
    }
  }, [user]);

  const hasRead = useCallback((articleId: string): boolean => {
    return history.some(item => item.articleId === articleId);
  }, [history]);

  const getHistoryByPerspective = useCallback((perspective: 'right' | 'left') => {
    return history.filter(item => item.perspective === perspective);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    hasRead,
    getHistoryByPerspective
  };
}
