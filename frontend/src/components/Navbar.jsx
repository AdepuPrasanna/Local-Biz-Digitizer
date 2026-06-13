import { useShop } from '../context/ShopContext';
import { Store, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { shop } = useShop();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 text-white p-1.5 rounded-lg">
            <Store size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight flex items-center gap-1.5">
              {shop?.shop_name || 'BizEase'}
              {shop?.duty_status === 'off_duty'
                ? <span className="badge-red">Closed</span>
                : <span className="badge-green">Open</span>}
            </p>
            {shop?.owner_name && (
              <p className="text-xs text-gray-400">{shop.owner_name}</p>
            )}
          </div>
        </div>
        <Link to="/profile"
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
          <UserCircle size={22} />
        </Link>
      </div>
    </header>
  );
}
