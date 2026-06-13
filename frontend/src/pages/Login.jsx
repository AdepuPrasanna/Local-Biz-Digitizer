import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Store, Mail, Lock, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';

export default function Login() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('user'); // 'user' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) { toast.error(error.message); setLoading(false); return; }

    if (mode === 'admin') {
      try {
        const { data } = await api.get('/api/shop/me');
        if (data.shop?.is_admin) {
          toast.success('Welcome back, Admin!');
          navigate('/admin');
        } else {
          await signOut();
          toast.error('This account does not have admin access');
        }
      } catch {
        await signOut();
        toast.error('Could not verify admin access');
      } finally {
        setLoading(false);
      }
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex bg-white/20 backdrop-blur p-4 rounded-2xl mb-4">
            <Store size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BizEase</h1>
          <p className="text-primary-200 mt-1 text-sm">Digitize your shop in minutes</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          {/* User / Admin toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button type="button" onClick={() => setMode('user')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'user' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>
              <User size={15} /> User
            </button>
            <button type="button" onClick={() => setMode('admin')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'admin' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>
              <ShieldCheck size={15} /> Admin
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {mode === 'admin' ? 'Admin Sign In' : 'Sign in'}
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            {mode === 'admin' ? 'Enter your admin account credentials' : 'Welcome back to BizEase'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="email" className="input pl-9" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-9"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : mode === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </button>
          </form>

          {mode === 'user' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              No account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
