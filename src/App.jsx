import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MarketingPage from './pages/MarketingPage';
import HubPage from './pages/HubPage';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import CheckEmail from './pages/CheckEmail';
import AuthCallback from './pages/AuthCallback';
import { useAuth } from './context/AuthContext';
// Little DJ — direct imports to avoid stale lazy-module cache
import DJHome from './games/little-dj/HomePage';
import DJGame from './games/little-dj/Game';

function HomePage() {
  const { user } = useAuth();
  if (user === undefined) return null; // loading
  return user ? <HubPage /> : <MarketingPage />;
}

const EngineerHome = lazy(() => import('./games/little-engineer/HomePage'));
const EngineerGame = lazy(() => import('./games/little-engineer/Game'));
const PianistHome  = lazy(() => import('./games/little-pianist/HomePage'));
const PianistGame  = lazy(() => import('./games/little-pianist/Game'));
const ShopperHome  = lazy(() => import('./games/little-shopper/HomePage'));
const ShopperGame  = lazy(() => import('./games/little-shopper/Game'));
const ChefHome      = lazy(() => import('./games/little-chef/HomePage'));
const ChefGame      = lazy(() => import('./games/little-chef/Game'));
const ChemistHome   = lazy(() => import('./games/little-chemist/HomePage'));
const ChemistGame   = lazy(() => import('./games/little-chemist/Game'));
const CoderHome     = lazy(() => import('./games/little-coder/HomePage'));
const CoderGame     = lazy(() => import('./games/little-coder/Game'));
const PourHome         = lazy(() => import('./games/little-pour/HomePage'));
const PourGame         = lazy(() => import('./games/little-pour/Game'));
const AstronomerHome   = lazy(() => import('./games/little-astronomer/HomePage'));
const AstronomerGame   = lazy(() => import('./games/little-astronomer/Game'));
const PieHome          = lazy(() => import('./games/little-pie/HomePage'));
const PieGame          = lazy(() => import('./games/little-pie/Game'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<MarketingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/hub" element={<HubPage />} />

          {/* Little Engineer ✓ name matches folder */}
          <Route path="/games/little-engineer"      element={<ProtectedRoute><EngineerHome /></ProtectedRoute>} />
          <Route path="/games/little-engineer/play" element={<ProtectedRoute><EngineerGame /></ProtectedRoute>} />

          {/* Little Pianist */}
          <Route path="/games/little-pianist"      element={<ProtectedRoute><PianistHome /></ProtectedRoute>} />
          <Route path="/games/little-pianist/play" element={<ProtectedRoute><PianistGame /></ProtectedRoute>} />

          {/* Little Shopper ✓ name matches folder */}
          <Route path="/games/little-shopper"      element={<ProtectedRoute><ShopperHome /></ProtectedRoute>} />
          <Route path="/games/little-shopper/play" element={<ProtectedRoute><ShopperGame /></ProtectedRoute>} />

          {/* Little Chef ✓ name matches folder */}
          <Route path="/games/little-chef"         element={<ProtectedRoute><ChefHome /></ProtectedRoute>} />
          <Route path="/games/little-chef/play"    element={<ProtectedRoute><ChefGame /></ProtectedRoute>} />

          {/* Little Chemist */}
          <Route path="/games/little-chemist"      element={<ProtectedRoute><ChemistHome /></ProtectedRoute>} />
          <Route path="/games/little-chemist/play" element={<ProtectedRoute><ChemistGame /></ProtectedRoute>} />

          {/* Little Coder */}
          <Route path="/games/little-coder"      element={<ProtectedRoute><CoderHome /></ProtectedRoute>} />
          <Route path="/games/little-coder/play" element={<ProtectedRoute><CoderGame /></ProtectedRoute>} />

          {/* Little Pour (Mathematician) */}
          <Route path="/games/little-pour"      element={<ProtectedRoute><PourHome /></ProtectedRoute>} />
          <Route path="/games/little-pour/play" element={<ProtectedRoute><PourGame /></ProtectedRoute>} />

          {/* Little Astronomer */}
          <Route path="/games/little-astronomer"      element={<ProtectedRoute><AstronomerHome /></ProtectedRoute>} />
          <Route path="/games/little-astronomer/play" element={<ProtectedRoute><AstronomerGame /></ProtectedRoute>} />

          {/* Little Analyst (Pie) */}
          <Route path="/games/little-pie"      element={<ProtectedRoute><PieHome /></ProtectedRoute>} />
          <Route path="/games/little-pie/play" element={<ProtectedRoute><PieGame /></ProtectedRoute>} />

          {/* Little DJ */}
          <Route path="/games/little-dj"           element={<ProtectedRoute><DJHome /></ProtectedRoute>} />
          <Route path="/games/little-dj/play"      element={<ProtectedRoute><DJGame /></ProtectedRoute>} />
          {/* Redirect old little-mixer URL */}
          <Route path="/games/little-mixer"         element={<Navigate to="/games/little-dj" replace />} />
          <Route path="/games/little-mixer/play"    element={<Navigate to="/games/little-dj/play" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
