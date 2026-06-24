import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ConversionLanding from './pages/ConversionLanding';
import Hub from './pages/Hub';
import AboutPage from './pages/AboutPage';
import FeedbackAdminPage from './pages/FeedbackAdminPage';
import GameScreen from './pages/GameScreen';
import BetaBanner from './components/BetaBanner';
import RouteMeta from './components/RouteMeta';
import ProtectedRoute from './components/ProtectedRoute';
import DevSubscriptionToggle from './components/DevSubscriptionToggle';
import Checkout from './pages/Checkout';
import DemoGamePage from './pages/DemoGamePage';
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
  // Logged-in users land on the /hub experience (Hub.jsx).
  // Logged-out visitors get the conversion-focused landing.
  return user ? <Hub /> : <ConversionLanding />;
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
const AstronautHome   = lazy(() => import('./games/little-astronaut/HomePage'));
const AstronautGame   = lazy(() => import('./games/little-astronaut/Game'));
const AnalystHome           = lazy(() => import('./games/little-analyst/HomePage'));
const AnalystGame           = lazy(() => import('./games/little-analyst/Game'));
const MatisseHome        = lazy(() => import('./games/little-matisse/HomePage'));
const MatisseGame        = lazy(() => import('./games/little-matisse/Game'));
const TraderHome         = lazy(() => import('./games/little-trader/HomePage'));
const TraderGame         = lazy(() => import('./games/little-trader/Game'));
const ConsultantHome     = lazy(() => import('./games/little-consultant/HomePage'));
const ConsultantGame     = lazy(() => import('./games/little-consultant/Game'));

function BetaBannerConditional() {
  const { pathname } = useLocation();
  // Mirror the logo's BETA-pill convention: hide on public / marketing /
  // sign-up funnel surfaces, show inside the product (hub, games, admin).
  const hidden =
    pathname === '/' ||
    ['/demo', '/signin', '/check-email', '/auth/callback', '/checkout', '/about'].some(
      (p) => pathname.startsWith(p)
    );
  if (hidden) return null;
  return <BetaBanner />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteMeta />
      <BetaBannerConditional />
      <DevSubscriptionToggle />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
          <Route path="/checkout" element={<Checkout />} />
          {/* Demo routes — public, no auth required (mirror TRIAL_GAME_IDS) */}
          <Route path="/demo/little-shopper"  element={<DemoGamePage><ShopperGame /></DemoGamePage>} />
          <Route path="/demo/little-engineer" element={<DemoGamePage><EngineerGame /></DemoGamePage>} />
          <Route path="/demo/little-dj"       element={<DemoGamePage><DJGame /></DemoGamePage>} />
          <Route path="/demo/little-coder"    element={<DemoGamePage><CoderGame /></DemoGamePage>} />
          <Route path="/demo/little-chemist"  element={<DemoGamePage><ChemistGame /></DemoGamePage>} />
          <Route path="/demo/little-chef"     element={<DemoGamePage><ChefGame /></DemoGamePage>} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/feedback" element={<FeedbackAdminPage />} />

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


          {/* Little Astronaut */}
          <Route path="/games/little-astronaut"      element={<ProtectedRoute><AstronautHome /></ProtectedRoute>} />
          <Route path="/games/little-astronaut/play" element={<ProtectedRoute><AstronautGame /></ProtectedRoute>} />

          {/* Little Analyst (Pie) */}
          <Route path="/games/little-analyst"      element={<ProtectedRoute><AnalystHome /></ProtectedRoute>} />
          <Route path="/games/little-analyst/play" element={<ProtectedRoute><AnalystGame /></ProtectedRoute>} />

          {/* Little Architect */}
          {/* Little Matisse */}
          <Route path="/games/little-matisse"      element={<ProtectedRoute><MatisseHome /></ProtectedRoute>} />
          <Route path="/games/little-matisse/play" element={<ProtectedRoute><MatisseGame /></ProtectedRoute>} />

          {/* Little Trader */}
          <Route path="/games/little-trader"      element={<ProtectedRoute><TraderHome /></ProtectedRoute>} />
          <Route path="/games/little-trader/play" element={<ProtectedRoute><TraderGame /></ProtectedRoute>} />

          {/* Little Consultant */}
          <Route path="/games/little-consultant"      element={<ProtectedRoute><ConsultantHome /></ProtectedRoute>} />
          <Route path="/games/little-consultant/play" element={<ProtectedRoute><ConsultantGame /></ProtectedRoute>} />

          {/* Little DJ */}
          <Route path="/games/little-dj"           element={<ProtectedRoute><DJHome /></ProtectedRoute>} />
          <Route path="/games/little-dj/play"      element={<ProtectedRoute><DJGame /></ProtectedRoute>} />
          {/* Redirect old little-mixer URL */}
          <Route path="/games/little-mixer"         element={<Navigate to="/games/little-dj" replace />} />
          <Route path="/games/little-mixer/play"    element={<Navigate to="/games/little-dj/play" replace />} />

          {/* Fallback for unknown /games/:id — shows placeholder card */}
          <Route path="/games/:id" element={<GameScreen />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
