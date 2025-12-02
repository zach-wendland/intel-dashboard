import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Bookmark {
  id: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  source: string;
  savedAt: Date;
  notes?: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`bookmarks_${user.id}`);
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
    }
  }, [user]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (user && bookmarks.length >= 0) {
      localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  const addBookmark = (
    articleId: string,
    articleTitle: string,
    articleUrl: string,
    source: string,
    notes?: string
  ) => {
    if (!user) {
      throw new Error('Must be logged in to bookmark');
    }

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
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const isBookmarked = (articleId: string): boolean => {
    return bookmarks.some(b => b.articleId === articleId);
  };

  const updateNotes = (bookmarkId: string, notes: string) => {
    setBookmarks(prev =>
      prev.map(b =>
        b.id === bookmarkId ? { ...b, notes } : b
      )
    );
  };

  const clearAllBookmarks = () => {
    if (user) {
      localStorage.removeItem(`bookmarks_${user.id}`);
      setBookmarks([]);
    }
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateNotes,
    clearAllBookmarks
  };
}
