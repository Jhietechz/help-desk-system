import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  LogOut, 
  Settings, 
  Users, 
  BarChart3,
  Wrench,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeView, setActiveView, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'technician', 'manager', 'admin'] },
    { id: 'tickets', label: 'My Tickets', icon: Ticket, roles: ['student', 'staff'] },
    { id: 'new-ticket', label: 'Report Issue', icon: PlusCircle, roles: ['student', 'staff'] },
    { id: 'assigned-tasks', label: 'My Tasks', icon: Wrench, roles: ['technician'] },
    { id: 'manage-queue', label: 'Manage Queue', icon: Clock, roles: ['manager', 'admin'] },
    { id: 'all-tickets', label: 'All Records', icon: CheckCircle2, roles: ['manager', 'admin'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['manager', 'admin'] },
    { id: 'users', label: 'Manage Users', icon: Users, roles: ['admin'] },
    { id: 'profile', label: 'Settings', icon: Settings, roles: ['student', 'technician', 'manager', 'admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-full bg-[#0a0a0b] lg:bg-[#111112] h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2 lg:mt-0 mt-4">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">UK</div>
        <div className="leading-none">
          <h1 className="text-sm font-bold tracking-tight text-white">UoK ICT</h1>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Helpdesk Portal</span>
        </div>
      </div>

      <div className="space-y-1 mb-auto">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-left",
              activeView === item.id 
                ? "bg-white/5 text-white" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={16} />
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 pt-6 mt-6 px-2">
        <div className="flex items-center gap-3 mb-6 bg-white/[0.02] p-3 rounded-lg border border-white/5 lg:bg-transparent lg:border-none lg:p-0">
          <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold ring-1 ring-blue-500/30">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{user.role}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded transition-all uppercase tracking-wider"
        >
          <LogOut size={14} />
          Logout System
        </button>
      </div>
    </div>
  );
}
