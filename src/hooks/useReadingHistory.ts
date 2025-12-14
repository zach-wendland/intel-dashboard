import { useState, useEffect, useCallback } from 'react';

export interface ReadingHistoryItem {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  source: string;
  readAt: Date;
  perspective: 'right' | 'left';
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
  // Use lazy initializer to load synchronously on first render
  const [history, setHistory] = useState<ReadingHistoryItem[]>(loadHistoryFromStorage);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((
    articleId: string,
    articleTitle: string,
    articleUrl: string,
    source: string,
    perspective: 'right' | 'left'
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
        readAt: new Date(),
        perspective
      };

      // Keep only the last MAX_HISTORY_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

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
