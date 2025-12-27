import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';

// Lazy load the dashboard component for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));

// Loading component for suspense fallback
function DashboardLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Loading America First Intelligence Grid...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<DashboardLoader />}>
        <Dashboard />
      </Suspense>
    </AuthProvider>
  );
}
