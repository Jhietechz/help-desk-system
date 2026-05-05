import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Bell, Search, Menu, X } from 'lucide-react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import Profile from './components/Profile';
import UserManage from './components/UserManage';
import Analytics from './components/Analytics';
import Notifications from './components/Notifications';
import { User, Ticket } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeView, setActiveView] = useState('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [initialResetToken, setInitialResetToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rToken = params.get('resetToken');
    if (rToken) {
      setInitialResetToken(rToken);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!token || !user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const currentRole = user.role;
      const [ticketsRes, statsRes, notifRes] = await Promise.all([
        axios.get('/api/tickets', config),
        (currentRole === 'admin' || currentRole === 'manager') ? axios.get('/api/stats', config) : Promise.resolve({ data: null }),
        axios.get('/api/notifications', config)
      ]);
      setTickets(ticketsRes.data);
      if (statsRes.data) setStats(statsRes.data);
      setNotifications(notifRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.status, err.response?.data);
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Optional: clear stale token if 403/401 persists
      }
    }
  }, [token, user?.role]);

  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [token, fetchData]);

  const handleLogin = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleTicketAction = async (ticketId: string, status: string) => {
    try {
      await axios.patch(`/api/tickets/${ticketId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Action: ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!token || !user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLogin={handleLogin} initialResetToken={initialResetToken} />
      </>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard stats={stats} user={user} onNavigate={setActiveView} />;
      case 'new-ticket':
        return <TicketForm onSuccess={() => { setActiveView('tickets'); fetchData(); }} />;
      case 'tickets':
      case 'all-tickets':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Maintenance / <span className="text-gray-500 font-normal">{activeView === 'tickets' ? 'Personal Logs' : 'Infrastructure Records'}</span>
            </h2>
            <TicketList 
              tickets={tickets} 
              userRole={user.role} 
              onAction={handleTicketAction} 
            />
          </div>
        );
      case 'assigned-tasks':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Operations / <span className="text-gray-500 font-normal">Active Assignments</span></h2>
            <TicketList 
              tickets={tickets.filter(t => t.assigned_to === user.id || t.status === 'Approved')} 
              userRole={user.role} 
              onAction={handleTicketAction} 
            />
          </div>
        );
      case 'manage-queue':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Triage / <span className="text-gray-500 font-normal">Approval Queue</span></h2>
            <TicketList 
              tickets={tickets.filter(t => t.status === 'New')} 
              userRole={user.role} 
              onAction={handleTicketAction} 
            />
          </div>
        );
      case 'analytics':
        return <Analytics tickets={tickets} />;
      case 'users':
        return <UserManage currentUser={user} />;
      case 'profile':
        return <Profile user={user} onUpdate={handleProfileUpdate} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0a0b] font-sans antialiased text-gray-200 overflow-x-hidden selection:bg-blue-500/30 font-sans">
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#111112',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        }}
      />

      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-[#0a0a0b] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md bg-black/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white tracking-widest text-[10px]">UOK</div>
          <span className="font-display font-bold text-white tracking-tight uppercase text-xs">ICT Helpdesk</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="text-gray-400 relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-[#0a0a0b]" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white bg-white/5 p-1.5 rounded"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-[#0a0a0b] border-r border-white/5 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          user={user} 
          activeView={activeView} 
          setActiveView={(view) => {
            setActiveView(view);
            setIsMobileMenuOpen(false);
          }} 
          onLogout={handleLogout} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-[#0a0a0b] border-b border-white/5 items-center justify-between px-8 sticky top-0 z-30 backdrop-blur-md bg-black/50">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded border border-white/5 w-64 group focus-within:border-blue-500/50 transition-all">
            <Search size={14} className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Query system..." 
              className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none w-full placeholder:text-gray-700" 
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#0a0a0b]" />
                )}
              </button>
              <Notifications 
                notifications={notifications} 
                isOpen={notifOpen} 
                onClose={() => setNotifOpen(false)} 
              />
            </div>
            
            <div className="h-6 w-px bg-white/5" />
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-0.5">{user.name}</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest leading-none">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-500 text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Notifications - Inline/Modal depending on state */}
        {notifOpen && (
          <div className="lg:hidden px-6 pt-4">
            <Notifications 
              notifications={notifications} 
              isOpen={notifOpen} 
              onClose={() => setNotifOpen(false)} 
            />
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto w-full scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
