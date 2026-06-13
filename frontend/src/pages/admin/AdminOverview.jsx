import { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Store, Power, FileText, IndianRupee } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}><Icon size={22} className="text-white" /></div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(err => toast.error(err.response?.data?.error || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Platform Overview</h1>
      <p className="text-sm text-gray-500 mb-6">Monitor and control every shop on BizEase from here.</p>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Store} label="Total Shops" value={stats?.total_shops ?? 0} color="bg-primary-600" />
          <StatCard icon={Power} label="On Duty" value={stats?.on_duty_shops ?? 0} color="bg-success-500" />
          <StatCard icon={Power} label="Off Duty" value={stats?.off_duty_shops ?? 0} color="bg-danger-500" />
          <StatCard icon={FileText} label="Total Bills" value={stats?.total_bills ?? 0} color="bg-purple-500" />
          <StatCard icon={IndianRupee} label="Platform Revenue" value={`₹${(stats?.total_revenue ?? 0).toFixed(0)}`} color="bg-warning-500" />
        </div>
      )}
    </div>
  );
}
