import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopSetup from './pages/ShopSetup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import NewBill from './pages/NewBill';
import BillHistory from './pages/BillHistory';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import ScanBill from './pages/ScanBill';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminShops from './pages/admin/AdminShops';
import AdminShopDetail from './pages/admin/AdminShopDetail';
import AdminBills from './pages/admin/AdminBills';

import { RefreshCw, WifiOff } from 'lucide-react';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
  </div>
);

const ConnectionError = ({ onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
    <div className="bg-danger-50 p-4 rounded-2xl mb-4">
      <WifiOff size={32} className="text-danger-500" />
    </div>
    <h2 className="text-lg font-bold text-gray-900 mb-1">Can't reach the server</h2>
    <p className="text-sm text-gray-500 mb-5 max-w-xs">
      We couldn't load your shop data. Check that the backend is running and reachable, then try again.
    </p>
    <button onClick={onRetry} className="btn-primary flex items-center gap-2">
      <RefreshCw size={16} /> Retry
    </button>
  </div>
);

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="max-w-lg mx-auto">{children}</main>
    <BottomNav />
  </>
);

const ProtectedRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { shop, shopLoading, shopError, fetchShop } = useShop();

  if (authLoading || shopLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Only redirect to Shop Setup if the server explicitly said "no shop" (no network error)
  if (!shop) {
    if (shopError === 'network') return <ConnectionError onRetry={fetchShop} />;
    return <Navigate to="/shop-setup" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/inventory"     element={<Inventory />} />
        <Route path="/new-bill"      element={<NewBill />} />
        <Route path="/bills"         element={<BillHistory />} />
        <Route path="/customers"     element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/scan"          element={<ScanBill />} />
        <Route path="/profile"       element={<Profile />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

// Standalone admin console — separate layout, requires admin shop
const AdminRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { shop, shopLoading, shopError, fetchShop } = useShop();

  if (authLoading || shopLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!shop) {
    if (shopError === 'network') return <ConnectionError onRetry={fetchShop} />;
    return <Navigate to="/" replace />;
  }
  if (!shop.is_admin) return <Navigate to="/" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route index               element={<AdminOverview />} />
        <Route path="shops"        element={<AdminShops />} />
        <Route path="shops/:id"    element={<AdminShopDetail />} />
        <Route path="bills"        element={<AdminBills />} />
        <Route path="*"            element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

// Handles "/" for logged-out visitors (Get Started landing), plus the auth-gated app
const RootRouter = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <Spinner />;

  // Logged out -> public "Get Started" landing page
  if (!user) return <Home />;

  return <ProtectedRoutes />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px' } }} />
          <AppRoutes />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Wrap routes so we can key the whole authenticated tree by user id —
// this guarantees a full remount (and fresh data fetch) on every login/logout/account switch.
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/shop-setup" element={<ShopSetup />} />
      <Route path="/about"      element={<About />} />
      <Route path="/admin/*"    element={<AdminRoutes key={user?.id || 'anon'} />} />
      <Route path="/*"          element={<RootRouter key={user?.id || 'anon'} />} />
    </Routes>
  );
}
