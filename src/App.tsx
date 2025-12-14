import { useState, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';

// Lazy load the unified dashboard component for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const PoliticalDonorTracker = lazy(() => import('./components/PoliticalDonorTracker'));

type View = 'landing' | 'right' | 'left' | 'political-tracker';

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
  // Use lazy initializer to load saved perspective synchronously
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('selected_perspective') as View | null;
    return (saved === 'right' || saved === 'left') ? saved : 'landing';
  });

  const handleSelectPerspective = (perspective: 'right' | 'left') => {
    setCurrentView(perspective);
    localStorage.setItem('selected_perspective', perspective);
  };

  const handleSwitchPerspective = () => {
    const newPerspective = currentView === 'right' ? 'left' : 'right';
    setCurrentView(newPerspective);
    localStorage.setItem('selected_perspective', newPerspective);
  };

  const handleOpenPoliticalTracker = () => {
    setCurrentView('political-tracker');
  };

  const handleBackFromTracker = () => {
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage
          onSelectPerspective={handleSelectPerspective}
          onOpenPoliticalTracker={handleOpenPoliticalTracker}
        />
      )}
      {(currentView === 'right' || currentView === 'left') && (
        <Suspense fallback={<DashboardLoader />}>
          <Dashboard
            perspective={currentView}
            onSwitchPerspective={handleSwitchPerspective}
          />
        </Suspense>
      )}
      {currentView === 'political-tracker' && (
        <Suspense fallback={<DashboardLoader />}>
          <PoliticalDonorTracker onBack={handleBackFromTracker} />
        </Suspense>
      )}
    </>
  );
}
