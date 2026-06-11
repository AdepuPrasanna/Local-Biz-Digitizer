import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useShop } from '../context/ShopContext';
import { IndianRupee, Package, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-3">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { shop } = useShop();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-5">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-4 text-white">
        <p className="text-primary-200 text-sm">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</p>
        <h2 className="text-xl font-bold mt-0.5">{shop?.shop_name}</h2>
        <p className="text-primary-200 text-xs mt-1">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={IndianRupee} label="Today's Sales" value={`₹${(data?.today_sales || 0).toFixed(0)}`} color="bg-success-500" sub={`${data?.today_bill_count || 0} bills`} />
        <StatCard icon={Package} label="Total Products" value={data?.total_products || 0} color="bg-primary-600" sub="in inventory" />
        <StatCard icon={IndianRupee} label="Pending Credit" value={`₹${(data?.total_pending_credit || 0).toFixed(0)}`} color="bg-warning-500" sub={`${data?.customers_with_credit?.length || 0} customers`} />
        <StatCard icon={FileText} label="Bills Today" value={data?.today_bill_count || 0} color="bg-purple-500" sub="generated" />
      </div>

      {/* Low Stock Alert */}
      {data?.low_stock_items?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-warning-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Low Stock Alert</h3>
            <span className="badge-yellow">{data.low_stock_items.length} items</span>
          </div>
          <div className="card divide-y divide-gray-50">
            {data.low_stock_items.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <p className="text-sm text-gray-700">{p.name}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.quantity === 0 ? 'bg-danger-50 text-danger-600' : 'bg-warning-50 text-warning-600'}`}>
                  {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                </span>
              </div>
            ))}
          </div>
          <Link to="/inventory" className="text-xs text-primary-600 font-medium mt-1 inline-block">View all inventory →</Link>
        </div>
      )}

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900 text-sm">Recent Bills</h3>
          </div>
          <Link to="/bills" className="text-xs text-primary-600 font-medium">See all →</Link>
        </div>
        {data?.recent_bills?.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No bills yet today</p>
            <Link to="/new-bill" className="text-primary-600 text-sm font-medium">Create your first bill →</Link>
          </div>
        ) : (
          <div className="card divide-y divide-gray-50">
            {data.recent_bills.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.customer_name}</p>
                  <p className="text-xs text-gray-400">{new Date(b.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{b.total_amount.toFixed(0)}</p>
                  <span className={b.paid ? 'badge-green' : 'badge-red'}>{b.paid ? 'Paid' : 'Credit'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
