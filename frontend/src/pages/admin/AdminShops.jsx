import { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Store, Power, ShieldCheck, ShieldOff, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchShops = async () => {
    try {
      const { data } = await api.get('/api/admin/shops');
      setShops(data.shops);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to load shops'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShops(); }, []);

  const toggleDuty = async (s) => {
    setBusyId(s.id);
    const newStatus = s.duty_status === 'off_duty' ? 'on_duty' : 'off_duty';
    try {
      await api.put(`/api/admin/shops/${s.id}/duty`, { duty_status: newStatus });
      setShops(prev => prev.map(x => x.id === s.id ? { ...x, duty_status: newStatus } : x));
      toast.success(`${s.shop_name} → ${newStatus === 'on_duty' ? 'On Duty 🟢' : 'Off Duty 🔴'}`);
    } catch { toast.error('Failed to update duty status'); }
    finally { setBusyId(null); }
  };

  const toggleAdmin = async (s) => {
    setBusyId(s.id + '-admin');
    try {
      const { data } = await api.put(`/api/admin/shops/${s.id}/admin`, { is_admin: !s.is_admin });
      setShops(prev => prev.map(x => x.id === s.id ? { ...x, is_admin: data.shop.is_admin } : x));
      toast.success(`${s.shop_name} ${data.shop.is_admin ? 'is now an admin' : 'admin access revoked'}`);
    } catch { toast.error('Failed to update admin access'); }
    finally { setBusyId(null); }
  };

  const filtered = shops.filter(s =>
    s.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Shops</h1>
      <p className="text-sm text-gray-500 mb-4">Control duty status and admin access for every registered shop.</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search shop or owner..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Shop</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-center px-4 py-3 font-medium">Duty Status</th>
                <th className="text-center px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-100 text-primary-600 font-bold rounded-full w-8 h-8 flex items-center justify-center text-xs flex-shrink-0">
                        {s.shop_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{s.shop_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.owner_name || '—'} {s.phone && <span className="text-gray-300">· {s.phone}</span>}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleDuty(s)} disabled={busyId === s.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${s.duty_status === 'off_duty' ? 'bg-danger-50 text-danger-600 hover:bg-danger-100' : 'bg-success-50 text-success-600 hover:bg-success-100'}`}>
                      <Power size={12} />
                      {s.duty_status === 'off_duty' ? 'Off Duty' : 'On Duty'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleAdmin(s)} disabled={busyId === s.id + '-admin'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${s.is_admin ? 'bg-primary-50 text-primary-600 hover:bg-primary-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {s.is_admin ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                      {s.is_admin ? 'Admin' : 'Make Admin'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/shops/${s.id}`} className="text-gray-400 hover:text-primary-600 inline-flex">
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400"><Store size={32} className="mx-auto mb-2 opacity-30" />No shops found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
