import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  stats: any;
  user: any;
  onNavigate: (view: string) => void;
}

export default function Dashboard({ stats, user, onNavigate }: DashboardProps) {
  const chartData = [
    { name: 'New', value: stats?.new || 0, color: '#3b82f6' },
    { name: 'Approved', value: stats?.approved || 0, color: '#10b981' },
    { name: 'In Progress', value: stats?.inProgress || 0, color: '#f59e0b' },
    { name: 'Resolved', value: stats?.resolved || 0, color: '#94a3b8' },
  ];

  const StatCard = ({ title, value, icon: Icon, color, delay = 0 }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111112] p-5 rounded-lg border border-white/5 flex flex-col justify-between h-32"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{title}</p>
        <div className={cn("p-1.5 rounded-md bg-opacity-10", color.bg)}>
          <Icon className={color.text} size={16} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-light text-white">{value}</h2>
        <span className="text-xs text-gray-600 font-medium">Updated</span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Overview / <span className="text-gray-500 font-normal">Dashboard</span></h2>
          <p className="text-gray-500 text-sm mt-1">Real-time infrastructure health and maintenance metrics.</p>
        </div>
        {['student', 'staff'].includes(user.role) && (
          <button 
            onClick={() => onNavigate('new-ticket')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded text-xs font-bold transition-all shadow-lg shadow-blue-900/20 uppercase tracking-wide"
          >
            <PlusCircle size={16} />
            Create New Ticket
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Requests" 
          value={stats?.total || 0} 
          icon={Activity} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-400' }}
          delay={0.1}
        />
        <StatCard 
          title="Pending Approval" 
          value={stats?.new || 0} 
          icon={Clock} 
          color={{ bg: 'bg-amber-500', text: 'text-amber-400' }}
          delay={0.2}
        />
        <StatCard 
          title="In Progress" 
          value={stats?.inProgress || 0} 
          icon={Activity} 
          color={{ bg: 'bg-indigo-500', text: 'text-indigo-400' }}
          delay={0.3}
        />
        <StatCard 
          title="Resolved (MTD)" 
          value={stats?.resolved || 0} 
          icon={CheckCircle2} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-400' }}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111112] p-6 rounded-lg border border-white/5 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Maintenance Distribution</h3>
            <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-gray-500 uppercase">
              Operational
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#111112', borderRadius: '8px', border: '1px solid #ffffff10', boxShadow: 'none' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 p-8 rounded-lg text-white flex flex-col justify-between">
          <div>
            <div className="bg-blue-600 w-10 h-10 rounded flex items-center justify-center mb-6 shadow-lg shadow-blue-900/40">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight">Infrastructure Notice</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Major maintenance is scheduled for the Graduate School Annex servers this Friday at 23:00. Expect intermittent outages.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="bg-white/5 p-4 rounded border border-white/5">
              <p className="text-[9px] uppercase font-bold tracking-widest text-blue-400 mb-1">ICT Emergency Line</p>
              <p className="text-lg font-light tracking-wide text-white">+254 7XX XXX XXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
