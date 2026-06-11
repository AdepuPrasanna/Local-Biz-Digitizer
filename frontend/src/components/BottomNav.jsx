import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Users, ScanLine } from 'lucide-react';

const tabs = [
  { to: '/',          icon: LayoutDashboard, label: 'Home' },
  { to: '/inventory', icon: Package,         label: 'Stock' },
  { to: '/new-bill',  icon: FileText,        label: 'Bill' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/scan',      icon: ScanLine,        label: 'Scan' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1 rounded-xl transition-all ${isActive ? 'bg-primary-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
