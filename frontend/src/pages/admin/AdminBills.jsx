import { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FileText, MessageCircle } from 'lucide-react';

export default function AdminBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/bills')
      .then(r => setBills(r.data.bills))
      .catch(err => toast.error(err.response?.data?.error || 'Failed to load bills'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">All Bills</h1>
      <p className="text-sm text-gray-500 mb-4">Latest 100 bills generated across every shop on the platform.</p>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Shop</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bills.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.shop_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{b.customer_name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{Number(b.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className={b.paid ? 'badge-green' : 'badge-yellow'}>{b.paid ? 'Paid' : 'Credit'}</span>
                      {b.whatsapp_sent && <MessageCircle size={12} className="text-success-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400"><FileText size={32} className="mx-auto mb-2 opacity-30" />No bills yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
