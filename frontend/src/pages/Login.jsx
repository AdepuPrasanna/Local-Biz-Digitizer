import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) { toast.error(error.message); setLoading(false); }
    else { toast.success('Welcome back!'); navigate('/'); }
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in</h2>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            No account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
