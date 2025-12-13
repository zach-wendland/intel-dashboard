import { useState, useEffect, useCallback, useRef } from 'react';
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

function loadBookmarksFromStorage(userId: string): Bookmark[] {
  const stored = localStorage.getItem(`bookmarks_${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((b: Bookmark) => ({
        ...b,
        savedAt: new Date(b.savedAt)
      }));
    } catch (e) {
      console.error('Failed to parse bookmarks', e);
    }
  }
  return [];
}

export function useBookmarks() {
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);

  // Initialize bookmarks - lazy init for first render
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (user) {
      return loadBookmarksFromStorage(user.id);
    }
    return [];
  });

  // Sync bookmarks when user changes (login/logout)
  useEffect(() => {
    const currentUserId = user?.id ?? null;

    // Only update if user actually changed
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;

      if (currentUserId) {
        // User logged in - load their bookmarks
        const loaded = loadBookmarksFromStorage(currentUserId);
        setBookmarks(loaded);
      } else {
        // User logged out - clear bookmarks
        setBookmarks([]);
      }
    }
  }, [user]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (user && bookmarks.length >= 0) {
      localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  const addBookmark = useCallback((
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
  }, [user]);

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
    if (user) {
      localStorage.removeItem(`bookmarks_${user.id}`);
      setBookmarks([]);
    }
  }, [user]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateNotes,
    clearAllBookmarks
  };
}
