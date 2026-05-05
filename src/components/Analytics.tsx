import React from 'react';
import { 
  AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsProps {
  tickets: any[];
}

export default function Analytics({ tickets }: AnalyticsProps) {
  // Aggregate data for charts
  const categoryData = [
    { name: 'Networking', value: tickets.filter(t => t.category === 'Networking').length },
    { name: 'Hardware', value: tickets.filter(t => t.category === 'Hardware').length },
    { name: 'Software', value: tickets.filter(t => t.category === 'Software').length },
    { name: 'Electrical', value: tickets.filter(t => t.category === 'Electrical').length },
    { name: 'Other', value: tickets.filter(t => t.category === 'Other').length },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length },
    { name: 'Awaiting', value: tickets.filter(t => ['New', 'Approved', 'In Progress'].includes(t.status)).length },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-8">
      <div className="mb-10">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Intelligence / <span className="text-gray-500 font-normal">SLA & Infrastructure Metrics</span></h2>
        <p className="text-gray-500 text-sm mt-1">Strategic data analysis to improve campus-wide technical response times.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111112] border border-white/5 rounded-lg p-8 min-w-0"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-blue-500" /> Resolution Volume by Category
            </h3>
          </div>
          <div className="h-[250px]">
            {categoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#111112', borderRadius: '8px', border: '1px solid #ffffff10' }}
                   itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                 />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-700 text-xs font-bold uppercase tracking-widest">
                Insufficient Data
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111112] border border-white/5 rounded-lg p-8 min-w-0"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> System Uptime Consistency
            </h3>
          </div>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[{n:1, v:98},{n:2, v:95},{n:3, v:99},{n:4, v:97},{n:5, v:100}]}>
                 <defs>
                   <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} />
                 <XAxis hide />
                 <YAxis hide domain={[90, 100]} />
                 <Tooltip />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Avg Resolution Time</p>
          <h4 className="text-2xl font-light text-white tracking-tight">4.2 Hours</h4>
        </div>
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Resolved (MTD)</p>
          <h4 className="text-2xl font-light text-white tracking-tight">{tickets.filter(t => t.status === 'Resolved').length} Tasks</h4>
        </div>
        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Queue Backlog</p>
          <h4 className="text-2xl font-light text-white tracking-tight">{tickets.filter(t => t.status === 'New').length} pending</h4>
        </div>
      </div>
    </div>
  );
}
