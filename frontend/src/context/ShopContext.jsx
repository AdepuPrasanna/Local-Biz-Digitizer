import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext({});

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);

  const fetchShop = async () => {
    try {
      const { data } = await api.get('/api/shop/me');
      setShop(data.shop);
    } catch {
      setShop(null);
    } finally {
      setShopLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchShop();
    else { setShop(null); setShopLoading(false); }
  }, [user]);

  return (
    <ShopContext.Provider value={{ shop, setShop, shopLoading, fetchShop }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
