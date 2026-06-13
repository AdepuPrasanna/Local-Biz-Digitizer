import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, FileText, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',       icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/shops', icon: Store,           label: 'Shops' },
  { to: '/admin/bills', icon: FileText,        label: 'All Bills' },
];

export default function AdminLayout({ children }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-800">
          <div className="bg-primary-600 p-1.5 rounded-lg"><ShieldCheck size={18} className="text-white" /></div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">BizEase</p>
            <p className="text-xs text-gray-400">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Store size={18} /> Exit to Shop App
          </NavLink>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger-400 hover:bg-gray-800 w-full transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56 min-h-screen">
        {children}
      </div>
    </div>
  );
}
