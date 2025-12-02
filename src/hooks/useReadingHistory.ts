import { useState, useEffect } from 'react';
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

export function useReadingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`reading_history_${user.id}`);
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
    }
  }, [user]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (user && history.length >= 0) {
      localStorage.setItem(`reading_history_${user.id}`, JSON.stringify(history));
    }
  }, [history, user]);

  const addToHistory = (
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
  };

  const clearHistory = () => {
    if (user) {
      localStorage.removeItem(`reading_history_${user.id}`);
      setHistory([]);
    }
  };

  const hasRead = (articleId: string): boolean => {
    return history.some(item => item.articleId === articleId);
  };

  const getHistoryByPerspective = (perspective: 'right' | 'left') => {
    return history.filter(item => item.perspective === perspective);
  };

  return {
    history,
    addToHistory,
    clearHistory,
    hasRead,
    getHistoryByPerspective
  };
}
