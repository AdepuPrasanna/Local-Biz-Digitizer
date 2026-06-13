import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { FileText, MessageCircle, X, Send } from 'lucide-react';
import BillReceipt from '../components/BillReceipt';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/api/bills');
      setBills(data.bills);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBills(); }, []);

  const filterBills = () => {
    const now = new Date();
    return bills.filter(b => {
      const d = new Date(b.created_at);
      if (filter === 'today') return d.toDateString() === now.toDateString();
      if (filter === 'week') return (now - d) < 7 * 86400000;
      return true;
    });
  };

  const handleResend = async (bill) => {
    if (!bill.customer_phone) { toast.error('No phone number for this customer'); return; }
    setSending(true);
    try {
      await api.post(`/api/whatsapp/send/${bill.id}`);
      toast.success('Receipt sent via WhatsApp!');
      fetchBills();
      setSelected(prev => prev ? { ...prev, whatsapp_sent: true } : null);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to send'); }
    finally { setSending(false); }
  };

  const visible = filterBills();

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Bill History</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[['today','Today'],['week','This Week'],['all','All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No bills found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(b => (
            <button key={b.id} onClick={() => setSelected(b)}
              className="card w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-1.5 h-12 rounded-full ${b.paid ? 'bg-success-500' : 'bg-warning-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{b.customer_name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(b.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })} · {b.bill_items?.length || 0} items
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{b.total_amount?.toFixed(0)}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span className={b.paid ? 'badge-green' : 'badge-yellow'}>{b.paid ? 'Paid' : 'Credit'}</span>
                  {b.whatsapp_sent && <MessageCircle size={12} className="text-success-500" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bill Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Bill Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 rounded-lg"><X size={20} /></button>
            </div>

            <BillReceipt bill={selected} />

            <button onClick={() => handleResend(selected)} disabled={sending || !selected.customer_phone}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              <Send size={16} />
              {sending ? 'Sending...' : selected.whatsapp_sent ? 'Resend WhatsApp Receipt' : 'Send WhatsApp Receipt'}
            </button>
            {!selected.customer_phone && <p className="text-xs text-center text-gray-400 mt-2">No phone number on record</p>}
          </div>
        </div>
      )}
    </div>
  );
}
