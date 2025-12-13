import { useState, useEffect, useCallback } from 'react';

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

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBookmarks(parsed.map((b: Bookmark) => ({
          ...b,
          savedAt: new Date(b.savedAt)
        })));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarks.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = useCallback((
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
  }, []);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);

  const isBookmarked = useCallback((articleId: string): boolean => {
    return bookmarks.some(b => b.articleId === articleId);
  }, [bookmarks]);

  const updateNotes = useCallback((bookmarkId: string, notes: string) => {
    setBookmarks(prev =>
      prev.map(b =>
        b.id === bookmarkId ? { ...b, notes } : b
      )
    );
  }, []);

  const clearAllBookmarks = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateNotes,
    clearAllBookmarks
  };
}
