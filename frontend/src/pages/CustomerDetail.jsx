import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X, TrendingDown, TrendingUp } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'payment', note: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/api/customers'),
        api.get(`/api/credit/${id}`)
      ]);
      const found = cRes.data.customers.find(c => c.id === id);
      setCustomer(found);
      setLedger(lRes.data.entries);
      setBalance(lRes.data.balance);
    } catch { toast.error('Failed to load data'); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleEntry = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) { toast.error('Enter valid amount'); return; }
    setSaving(true);
    try {
      await api.post('/api/credit', { customer_id: id, amount: parseFloat(form.amount), type: form.type, note: form.note });
      toast.success(form.type === 'payment' ? 'Payment recorded ✅' : 'Credit added');
      setModal(false);
      setForm({ amount: '', type: 'payment', note: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/customers')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{customer?.name || 'Customer'}</h1>
        <button onClick={() => setModal(true)} className="btn-primary py-2 px-3 flex items-center gap-1.5 text-sm">
          <Plus size={16} /> Entry
        </button>
      </div>

      {/* Balance Card */}
      <div className={`rounded-2xl p-5 text-white mb-4 ${balance > 0 ? 'bg-gradient-to-r from-warning-500 to-orange-500' : 'bg-gradient-to-r from-success-500 to-emerald-600'}`}>
        <p className="text-white/70 text-sm">Current Balance</p>
        <p className="text-3xl font-bold mt-1">₹{Math.abs(balance).toFixed(2)}</p>
        <p className="text-white/80 text-sm mt-1">{balance > 0 ? '⚠️ Owes you money' : balance === 0 ? '✅ All clear' : '✅ Overpaid'}</p>
        {customer?.phone && <p className="text-white/60 text-xs mt-2">📱 {customer.phone}</p>}
      </div>

      {/* Ledger */}
      <h3 className="font-semibold text-gray-700 text-sm mb-2">Transaction History</h3>
      {ledger.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ledger.map(entry => (
            <div key={entry.id} className="card flex items-center gap-3">
              <div className={`p-2 rounded-xl ${entry.type === 'credit' ? 'bg-danger-50' : 'bg-success-50'}`}>
                {entry.type === 'credit'
                  ? <TrendingUp size={16} className="text-danger-500" />
                  : <TrendingDown size={16} className="text-success-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 capitalize">{entry.type === 'credit' ? 'Credit Given' : 'Payment Received'}</p>
                {entry.note && <p className="text-xs text-gray-400">{entry.note}</p>}
                <p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
              </div>
              <p className={`font-bold text-sm ${entry.type === 'credit' ? 'text-danger-500' : 'text-success-600'}`}>
                {entry.type === 'credit' ? '+' : '-'}₹{entry.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Entry</h3>
              <button onClick={() => setModal(false)} className="p-1 text-gray-400 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleEntry} className="space-y-3">
              <div>
                <label className="label">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['payment','Payment Received'],['credit','Credit Given']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setForm(p => ({ ...p, type: val }))}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${form.type === val ? val === 'payment' ? 'bg-success-500 text-white' : 'bg-danger-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="label">Amount (₹)</label><input type="number" className="input" placeholder="0.00" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
              <div><label className="label">Note (optional)</label><input className="input" placeholder="e.g. Bill #123" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Entry'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
