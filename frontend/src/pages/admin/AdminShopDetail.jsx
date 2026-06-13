import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, Users, FileText, IndianRupee, Power, ShieldCheck, ShieldOff, Phone, MapPin } from 'lucide-react';

export default function AdminShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/api/admin/shops/${id}`);
      setShop(data.shop);
      setStats(data.stats);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to load shop'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const toggleDuty = async () => {
    setBusy(true);
    const newStatus = shop.duty_status === 'off_duty' ? 'on_duty' : 'off_duty';
    try {
      const { data } = await api.put(`/api/admin/shops/${id}/duty`, { duty_status: newStatus });
      setShop(data.shop);
      toast.success(newStatus === 'on_duty' ? 'Shop set to On Duty 🟢' : 'Shop set to Off Duty 🔴');
    } catch { toast.error('Failed to update'); }
    finally { setBusy(false); }
  };

  const toggleAdmin = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/api/admin/shops/${id}/admin`, { is_admin: !shop.is_admin });
      setShop(data.shop);
      toast.success(data.shop.is_admin ? 'Admin access granted' : 'Admin access revoked');
    } catch { toast.error('Failed to update'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!shop) return <div className="p-6 text-gray-400">Shop not found</div>;

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/admin/shops" className="inline-flex items-center gap-2 text-gray-500 text-sm mb-4 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Shops
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 text-primary-600 font-bold rounded-2xl w-12 h-12 flex items-center justify-center text-lg flex-shrink-0">
              {shop.shop_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{shop.shop_name}</h1>
              <p className="text-sm text-gray-500">{shop.owner_name}</p>
            </div>
          </div>
          <span className={shop.duty_status === 'off_duty' ? 'badge-red' : 'badge-green'}>
            {shop.duty_status === 'off_duty' ? 'Off Duty' : 'On Duty'}
          </span>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          {shop.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {shop.phone}</span>}
          {shop.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {shop.address}</span>}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
          <button onClick={toggleDuty} disabled={busy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${shop.duty_status === 'off_duty' ? 'bg-success-50 text-success-600 hover:bg-success-100' : 'bg-danger-50 text-danger-600 hover:bg-danger-100'}`}>
            <Power size={15} /> {shop.duty_status === 'off_duty' ? 'Set On Duty' : 'Set Off Duty'}
          </button>
          <button onClick={toggleAdmin} disabled={busy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${shop.is_admin ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}>
            {shop.is_admin ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
            {shop.is_admin ? 'Revoke Admin Access' : 'Grant Admin Access'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-xl"><Package size={18} className="text-primary-600" /></div>
          <div><p className="text-lg font-bold text-gray-900">{stats.products}</p><p className="text-xs text-gray-500">Products</p></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-xl"><Users size={18} className="text-purple-600" /></div>
          <div><p className="text-lg font-bold text-gray-900">{stats.customers}</p><p className="text-xs text-gray-500">Customers</p></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-warning-50 p-2 rounded-xl"><FileText size={18} className="text-warning-500" /></div>
          <div><p className="text-lg font-bold text-gray-900">{stats.bills}</p><p className="text-xs text-gray-500">Bills</p></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-success-50 p-2 rounded-xl"><IndianRupee size={18} className="text-success-500" /></div>
          <div><p className="text-lg font-bold text-gray-900">₹{stats.total_revenue.toFixed(0)}</p><p className="text-xs text-gray-500">Revenue</p></div>
        </div>
      </div>
    </div>
  );
}
