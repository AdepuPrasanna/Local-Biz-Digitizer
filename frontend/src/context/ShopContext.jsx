import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext({});

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState(null);

  const fetchShop = async () => {
    setShopLoading(true);
    setShopError(null);
    try {
      const { data } = await api.get('/api/shop/me');
      // data.shop is null only when the server explicitly confirms "no shop yet"
      setShop(data.shop ?? null);
    } catch (err) {
      // Network / CORS / server-down errors must NOT be treated as "no shop" —
      // otherwise existing users get wrongly bounced to Shop Setup.
      setShop(null);
      if (!err.response) {
        setShopError('network');
      } else {
        setShopError('server');
      }
    } finally {
      setShopLoading(false);
    }
  };

  // Reset everything immediately when the logged-in user changes (login/logout/switch account)
  useEffect(() => {
    setShop(null);
    setShopError(null);
    if (user) {
      fetchShop();
    } else {
      setShopLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <ShopContext.Provider value={{ shop, setShop, shopLoading, shopError, fetchShop }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
