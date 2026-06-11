import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

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

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
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
  const { shop, shopLoading } = useShop();

  if (authLoading || shopLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!shop) return <Navigate to="/shop-setup" replace />;

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
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px' } }} />
          <Routes>
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/shop-setup" element={<ShopSetup />} />
            <Route path="/*"          element={<ProtectedRoutes />} />
          </Routes>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
