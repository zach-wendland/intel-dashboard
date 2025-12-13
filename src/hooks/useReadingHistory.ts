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

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed.map((item: ReadingHistoryItem) => ({
          ...item,
          readAt: new Date(item.readAt)
        })));
      } catch (e) {
        console.error('Failed to parse reading history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
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
