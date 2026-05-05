import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Settings, Shield, Trash2, Save, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
  onLogout: () => void;
}

export default function Profile({ user, onUpdate, onLogout }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`/api/users/${user.id}`, 
        { name, email, ...(password ? { password } : {}) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Account updated successfully');
      onUpdate(res.data);
      setPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure? This will permanently delete your account.')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Account deleted');
      onLogout();
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-10">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">System / <span className="text-gray-500 font-normal">Account Settings</span></h2>
        <p className="text-gray-500 text-sm mt-1">Manage your identity and security preferences within the ICT portal.</p>
      </div>

      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111112] border border-white/5 rounded-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-blue-500" /> Personal Details
            </h3>
          </div>
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              >
                <Save size={14} />
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111112] border border-white/5 rounded-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Key size={14} className="text-amber-500" /> Change Password
            </h3>
          </div>
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !password}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30"
              >
                <Shield size={14} />
                Update Security
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-500/5 border border-red-500/10 rounded-lg p-6 flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
            <p className="text-xs text-red-500/60 mt-1">Once deleted, your account and all associated tickets cannot be recovered.</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-900/20"
          >
            <Trash2 size={14} />
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
