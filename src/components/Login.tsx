import React, { useState } from 'react';
import axios from 'axios';
import { LogIn, UserPlus, ShieldAlert, GraduationCap, Wrench, LayoutDashboard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
  initialResetToken: string | null;
}

export default function Login({ onLogin, initialResetToken }: LoginProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialResetToken ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await axios.post('/api/auth/login', { email, password });
        onLogin(res.data.token, res.data.user);
        toast.success(`Session Initialized: ${res.data.user.name}`);
      } else if (view === 'register') {
        await axios.post('/api/auth/register', { name, email, password, role });
        toast.success('Registration successful. Secure your credentials.');
        setView('login');
      } else if (view === 'forgot') {
        await axios.post('/api/auth/forgot-password', { email });
        toast.success('Check your email for reset instructions.');
        setView('login');
      } else if (view === 'reset') {
        await axios.post('/api/auth/reset-password', { token: initialResetToken, password });
        toast.success('Password reset successful. Please login.');
        setView('login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 selection:bg-blue-500/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#111112] rounded-lg shadow-2xl overflow-hidden border border-white/5"
      >
        <div className="bg-gradient-to-br from-blue-900/40 to-black p-10 text-center border-b border-white/5">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-3xl shadow-xl shadow-blue-900/30">UK</div>
          </div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight leading-none">University of Kabianga</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-3 font-bold">Infrastructure Control Center</p>
        </div>

        <div className="p-8">
          {(view === 'login' || view === 'register') && (
            <div className="flex bg-black/50 rounded p-1 mb-8 border border-white/5">
              <button 
                onClick={() => setView('login')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                  view === 'login' ? 'bg-white/5 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Access
              </button>
              <button 
                onClick={() => setView('register')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                  view === 'register' ? 'bg-white/5 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Provision
              </button>
            </div>
          )}

          {view === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-white text-sm font-bold uppercase tracking-widest">Reset Access</h2>
              <p className="text-gray-500 text-[10px] mt-1">Enter your email to receive recovery instructions.</p>
            </div>
          )}

          {view === 'reset' && (
            <div className="mb-6">
              <h2 className="text-white text-sm font-bold uppercase tracking-widest">New Credentials</h2>
              <p className="text-gray-500 text-[10px] mt-1">Establish your new secure access key.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Legal Identity</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-800"
                  placeholder="Full Name"
                />
              </div>
            )}

            {view !== 'reset' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Network ID (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-800"
                  placeholder="id@kabianga.ac.ke"
                />
              </div>
            )}

            {view !== 'forgot' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {view === 'reset' ? 'New Secure Key' : 'Secure Key'}
                </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-800"
                placeholder="••••••••"
              />
            </div>
            )}

            {view === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">System Role</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`px-3 py-2 border rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                      role === 'student' ? 'border-blue-500 bg-blue-500/5 text-blue-500' : 'border-white/10 bg-transparent text-gray-600'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('technician')}
                    className={`px-3 py-2 border rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                      role === 'technician' ? 'border-blue-500 bg-blue-500/5 text-blue-500' : 'border-white/10 bg-transparent text-gray-600'
                    }`}
                  >
                    Technician
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded text-xs uppercase tracking-[0.2em] transition-all mt-6 shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                view === 'login' ? 'Authenticate Session' : 
                view === 'register' ? 'Request Provisioning' :
                view === 'forgot' ? 'Send Recovery Link' : 'Finalize Reset'
              )}
            </button>
          </form>

          {view === 'login' && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setView('forgot')}
                className="text-[10px] font-bold text-gray-600 hover:text-blue-500 uppercase tracking-widest transition-colors"
              >
                Lost Access Key?
              </button>
            </div>
          )}

          {(view === 'forgot' || (view === 'reset' && !initialResetToken)) && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setView('login')}
                className="text-[10px] font-bold text-gray-600 hover:text-blue-500 uppercase tracking-widest transition-colors"
              >
                Back to Authentication
              </button>
            </div>
          )}

          {view === 'login' && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                   <ShieldAlert className="text-blue-500" size={14} />
                   <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">Developer Overrides</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] text-gray-500"><span className="text-blue-500/50 font-bold">Manager:</span> manager@kabianga.ac.ke | manager123</p>
                   <p className="text-[10px] text-gray-500"><span className="text-blue-500/50 font-bold">Admin:</span> admin@kabianga.ac.ke | admin123</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
