import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, Trash2, Mail, Shield, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface UserManageProps {
  currentUser: User;
}

export default function UserManage({ currentUser }: UserManageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to remove user');
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const roles: User['role'][] = ['student', 'technician', 'manager', 'admin'];

  return (
    <div className="max-w-6xl">
      <div className="mb-10 lg:flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Access Control / <span className="text-gray-500 font-normal">System Users</span></h2>
          <p className="text-gray-500 text-sm mt-1">Directory of all students, staff, and technicians with portal access.</p>
        </div>
      </div>

      <div className="bg-transparent lg:bg-[#111112] lg:border lg:border-white/5 lg:rounded-lg overflow-hidden">
        {/* Mobile View (Cards) */}
        <div className="lg:hidden space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-[#111112] border border-white/5 p-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-400">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm line-clamp-1">{user.name}</p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                      <Mail size={10} />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <button 
                  disabled={user.id === currentUser.id}
                  onClick={() => handleDelete(user.id)}
                  className={cn(
                    "p-2 rounded hover:bg-red-500/10 transition-colors",
                    user.id === currentUser.id ? "text-gray-900 cursor-not-allowed" : "text-gray-600 hover:text-red-500"
                  )}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] uppercase font-bold text-gray-700 tracking-widest mb-1 block">Account Access</label>
                  <button
                    disabled={user.id === currentUser.id}
                    onClick={() => handleUpdateUser(user.id, { isApproved: !user.isApproved })}
                    className={cn(
                      "w-full px-2 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-all",
                      user.id === currentUser.id ? "opacity-50 cursor-not-allowed border-white/5" : "",
                      user.isApproved 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}
                  >
                    {user.isApproved ? 'Approved' : 'Pending'}
                  </button>
                </div>
                <div>
                  <label className="text-[8px] uppercase font-bold text-gray-700 tracking-widest mb-1 block">System Role</label>
                  <select
                    value={user.role}
                    disabled={user.id === currentUser.id}
                    onChange={(e) => handleUpdateUser(user.id, { role: e.target.value as any })}
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] uppercase font-bold text-gray-400 focus:outline-none focus:border-blue-500 transition-all",
                      user.id === currentUser.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-bold">Identity</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold">Authorization</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-white group-hover:bg-blue-600 transition-all">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-200 group-hover:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      disabled={user.id === currentUser.id}
                      onClick={() => handleUpdateUser(user.id, { isApproved: !user.isApproved })}
                      className={cn(
                        "px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border transition-all",
                        user.id === currentUser.id ? "opacity-50 cursor-not-allowed border-white/5" : "",
                        user.isApproved 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}
                    >
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={user.role}
                        disabled={user.id === currentUser.id}
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value as any })}
                        className={cn(
                          "bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] uppercase font-bold text-gray-400 focus:outline-none focus:border-blue-500 transition-all",
                          user.id === currentUser.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {user.role === 'admin' ? (
                        <ShieldCheck size={14} className="text-blue-500" />
                      ) : (
                        <Shield size={14} className="text-gray-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 font-mono">
                      <button 
                        disabled={user.id === currentUser.id}
                        onClick={() => handleDelete(user.id)}
                        className={cn(
                          "transition-colors p-1",
                          user.id === currentUser.id ? "text-gray-900 cursor-not-allowed" : "text-gray-700 hover:text-red-500"
                        )}
                        title={user.id === currentUser.id ? "Cannot delete self" : "Revoke Access"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
