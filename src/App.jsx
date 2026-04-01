import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const DJHome = lazy(() => import('./games/little-dj/HomePage'));
const DJGame = lazy(() => import('./games/little-dj/Game'));
const ShopperHome = lazy(() => import('./games/little-shopper/HomePage'));
const ShopperGame = lazy(() => import('./games/little-shopper/Game'));
const ChefHome = lazy(() => import('./games/little-chef/HomePage'));
const ChefGame = lazy(() => import('./games/little-chef/Game'));
const MixerHome = lazy(() => import('./games/little-mixer/HomePage'));
const MixerGame = lazy(() => import('./games/little-mixer/Game'));

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
          <Route path="/games/little-engineer" element={<ProtectedRoute><EngineerHome /></ProtectedRoute>} />
          <Route path="/games/little-engineer/play" element={<ProtectedRoute><EngineerGame /></ProtectedRoute>} />
          <Route path="/games/little-dj" element={<ProtectedRoute><DJHome /></ProtectedRoute>} />
          <Route path="/games/little-dj/play" element={<ProtectedRoute><DJGame /></ProtectedRoute>} />
          <Route path="/games/little-shopper" element={<ProtectedRoute><ShopperHome /></ProtectedRoute>} />
          <Route path="/games/little-shopper/play" element={<ProtectedRoute><ShopperGame /></ProtectedRoute>} />
          <Route path="/games/little-chef" element={<ProtectedRoute><ChefHome /></ProtectedRoute>} />
          <Route path="/games/little-chef/play" element={<ProtectedRoute><ChefGame /></ProtectedRoute>} />
          <Route path="/games/little-mixer" element={<ProtectedRoute><MixerHome /></ProtectedRoute>} />
          <Route path="/games/little-mixer/play" element={<ProtectedRoute><MixerGame /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
