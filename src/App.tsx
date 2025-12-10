import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';

// Lazy load the unified dashboard component for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));

type View = 'landing' | 'right' | 'left';

// Loading component for suspense fallback
function DashboardLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  // Load saved perspective from localStorage
  useEffect(() => {
    const savedPerspective = localStorage.getItem('selected_perspective') as View | null;
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
      {(currentView === 'right' || currentView === 'left') && (
        <Suspense fallback={<DashboardLoader />}>
          <Dashboard
            perspective={currentView}
            onSwitchPerspective={handleSwitchPerspective}
          />
        </Suspense>
      )}
    </AuthProvider>
  );
}
