import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import RightWingDashboard from './components/RightWingDashboard';
import LeftWingDashboard from './components/LeftWingDashboard';

type Perspective = 'landing' | 'right' | 'left';

export default function App() {
  const [currentView, setCurrentView] = useState<Perspective>('landing');

  // Load saved perspective from localStorage
  useEffect(() => {
    const savedPerspective = localStorage.getItem('selected_perspective') as Perspective | null;
    if (savedPerspective && (savedPerspective === 'right' || savedPerspective === 'left')) {
      setCurrentView(savedPerspective);
    }
  }, []);

  const handleSelectPerspective = (perspective: 'right' | 'left') => {
    setCurrentView(perspective);
    localStorage.setItem('selected_perspective', perspective);
  };

  const handleSwitchPerspective = () => {
    const newPerspective = currentView === 'right' ? 'left' : 'right';
    setCurrentView(newPerspective);
    localStorage.setItem('selected_perspective', newPerspective);
  };

  return (
    <AuthProvider>
      {currentView === 'landing' && (
        <LandingPage onSelectPerspective={handleSelectPerspective} />
      )}
      {currentView === 'right' && (
        <RightWingDashboard onSwitchPerspective={handleSwitchPerspective} />
      )}
      {currentView === 'left' && (
        <LeftWingDashboard onSwitchPerspective={handleSwitchPerspective} />
      )}
    </AuthProvider>
  );
}
