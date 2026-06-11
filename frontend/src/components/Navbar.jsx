import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { shop } = useShop();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 text-white p-1.5 rounded-lg">
            <Store size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {shop?.shop_name || 'BizEase'}
            </p>
            {shop?.owner_name && (
              <p className="text-xs text-gray-400">{shop.owner_name}</p>
            )}
          </div>
        </div>
        <button onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
