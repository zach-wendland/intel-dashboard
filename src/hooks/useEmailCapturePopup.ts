import { useState, useEffect } from 'react';
import { saveEmailSignup } from '../lib/supabase';

const STORAGE_KEY = 'email_popup_dismissed';
const DELAY_MS = 15000; // Show after 15 seconds

export function useEmailCapturePopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);

    if (!dismissed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = async (email: string) => {
    // Try to save to Supabase first
    const { error } = await saveEmailSignup(email, 'popup');

    if (error) {
      // Fallback to localStorage if Supabase fails
      console.warn('Supabase error, falling back to localStorage:', error);
      const emails = JSON.parse(localStorage.getItem('email_signups') || '[]');
      emails.push({
        email,
        timestamp: new Date().toISOString(),
        source: 'popup'
      });
      localStorage.setItem('email_signups', JSON.stringify(emails));
    }

    // Mark popup as dismissed after successful submission
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return { showPopup, handleClose, handleSubmit };
}
