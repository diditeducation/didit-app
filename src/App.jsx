import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MarketingPage from './pages/MarketingPage';
import HubPage from './pages/HubPage';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import CheckEmail from './pages/CheckEmail';
import AuthCallback from './pages/AuthCallback';
import { useAuth } from './context/AuthContext';

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
const ChefHome     = lazy(() => import('./games/little-chef/HomePage'));
const ChefGame     = lazy(() => import('./games/little-chef/Game'));
const DJHome       = lazy(() => import('./games/little-dj/HomePage'));
const DJGame       = lazy(() => import('./games/little-dj/Game'));

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

          {/* Little Pianist (folder: little-dj) */}
          <Route path="/games/little-pianist"      element={<ProtectedRoute><PianistHome /></ProtectedRoute>} />
          <Route path="/games/little-pianist/play" element={<ProtectedRoute><PianistGame /></ProtectedRoute>} />

          {/* Little Shopper ✓ name matches folder */}
          <Route path="/games/little-shopper"      element={<ProtectedRoute><ShopperHome /></ProtectedRoute>} />
          <Route path="/games/little-shopper/play" element={<ProtectedRoute><ShopperGame /></ProtectedRoute>} />

          {/* Little Chef ✓ name matches folder */}
          <Route path="/games/little-chef"         element={<ProtectedRoute><ChefHome /></ProtectedRoute>} />
          <Route path="/games/little-chef/play"    element={<ProtectedRoute><ChefGame /></ProtectedRoute>} />

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
