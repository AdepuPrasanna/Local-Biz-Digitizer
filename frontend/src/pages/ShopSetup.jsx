import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Store, MapPin, Phone, User } from 'lucide-react';

export default function ShopSetup() {
  const { fetchShop } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shop_name: '', owner_name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shop_name.trim()) { toast.error('Shop name is required'); return; }
    setLoading(true);
    try {
      await api.post('/api/shop/setup', form);
      await fetchShop();
      toast.success('Shop created! Welcome to BizEase 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex bg-white/20 backdrop-blur p-4 rounded-2xl mb-3">
            <Store size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Shop</h1>
          <p className="text-primary-200 text-sm mt-1">Just one step to get started</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Shop Name *</label>
              <div className="relative">
                <Store size={16} className="absolute left-3 top-3 text-gray-400" />
                <input className="input pl-9" placeholder="e.g. Sri Lakshmi Kirana"
                  value={form.shop_name} onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Owner Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input className="input pl-9" placeholder="Your full name"
                  value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input className="input pl-9" placeholder="9876543210" type="tel"
                  value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea className="input pl-9 resize-none" rows={2} placeholder="Shop address"
                  value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating Shop...' : 'Create My Shop 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
