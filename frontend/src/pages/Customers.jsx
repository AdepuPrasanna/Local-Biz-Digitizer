import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Users, Plus, X, IndianRupee, Phone, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/api/customers');
      setCustomers(data.customers);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await api.post('/api/customers', form);
      toast.success('Customer added');
      setModal(false);
      setForm({ name: '', phone: '' });
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Customers</h1>
        <button onClick={() => setModal(true)} className="btn-primary py-2 px-3 flex items-center gap-1.5 text-sm">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{customers.length}</p>
          <p className="text-xs text-gray-500">Total Customers</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning-500">₹{customers.reduce((s, c) => s + (c.total_credit || 0), 0).toFixed(0)}</p>
          <p className="text-xs text-gray-500">Total Pending Credit</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No customers yet</p>
          <button onClick={() => setModal(true)} className="mt-3 text-primary-600 text-sm font-medium">Add first customer →</button>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map(c => (
            <button key={c.id} onClick={() => navigate(`/customers/${c.id}`)}
              className="card w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 text-sm">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                {c.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {c.phone}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {c.total_credit > 0 ? (
                  <>
                    <p className="text-sm font-bold text-warning-600">₹{c.total_credit.toFixed(0)}</p>
                    <p className="text-xs text-warning-400">credit due</p>
                  </>
                ) : (
                  <span className="badge-green">Clear</span>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Customer</h3>
              <button onClick={() => setModal(false)} className="p-1 text-gray-400 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div><label className="label">Phone (WhatsApp)</label><input className="input" type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Customer'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
