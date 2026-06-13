import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Store, User, Phone, MapPin, LogOut, ShieldCheck, Info, Power } from 'lucide-react';

export default function Profile() {
  const { shop, setShop, fetchShop } = useShop();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shop_name: shop?.shop_name || '',
    owner_name: shop?.owner_name || '',
    phone: shop?.phone || '',
    address: shop?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [togglingDuty, setTogglingDuty] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.shop_name.trim()) { toast.error('Shop name is required'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/api/shop/profile', form);
      setShop(data.shop);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const toggleDuty = async () => {
    setTogglingDuty(true);
    const newStatus = shop?.duty_status === 'off_duty' ? 'on_duty' : 'off_duty';
    try {
      const { data } = await api.put('/api/shop/duty', { duty_status: newStatus });
      setShop(data.shop);
      toast.success(newStatus === 'on_duty' ? 'You are now Open 🟢' : 'You are now Closed 🔴');
    } catch { toast.error('Failed to update status'); }
    finally { setTogglingDuty(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Profile & Settings</h1>

      {/* Account Info */}
      <div className="card">
        <p className="text-xs text-gray-400 mb-1">Logged in as</p>
        <p className="font-semibold text-gray-900">{user?.email}</p>
      </div>

      {/* Shop Open/Closed toggle */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${shop?.duty_status === 'off_duty' ? 'bg-danger-50' : 'bg-success-50'}`}>
            <Power size={18} className={shop?.duty_status === 'off_duty' ? 'text-danger-500' : 'text-success-500'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Shop Status</p>
            <p className="text-xs text-gray-400">{shop?.duty_status === 'off_duty' ? 'Currently Closed' : 'Currently Open'}</p>
          </div>
        </div>
        <button onClick={toggleDuty} disabled={togglingDuty}
          className={`w-12 h-6 rounded-full transition-all ${shop?.duty_status !== 'off_duty' ? 'bg-success-500' : 'bg-gray-300'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${shop?.duty_status !== 'off_duty' ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Shop Settings Form */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Shop Details</h3>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Shop Name *</label>
            <div className="relative"><Store size={16} className="absolute left-3 top-3 text-gray-400" />
              <input className="input pl-9" value={form.shop_name} onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Owner Name</label>
            <div className="relative"><User size={16} className="absolute left-3 top-3 text-gray-400" />
              <input className="input pl-9" value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="relative"><Phone size={16} className="absolute left-3 top-3 text-gray-400" />
              <input className="input pl-9" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <div className="relative"><MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea className="input pl-9 resize-none" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Links */}
      <div className="card divide-y divide-gray-50">
        {shop?.is_admin && (
          <Link to="/admin" className="flex items-center gap-3 py-2.5 first:pt-0">
            <ShieldCheck size={18} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-800 flex-1">Admin Panel</span>
          </Link>
        )}
        <Link to="/about" className="flex items-center gap-3 py-2.5">
          <Info size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-800 flex-1">About BizEase</span>
        </Link>
        <button onClick={handleSignOut} className="flex items-center gap-3 py-2.5 w-full text-left last:pb-0">
          <LogOut size={18} className="text-danger-500" />
          <span className="text-sm font-medium text-danger-600 flex-1">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
