import React from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  MapPin, 
  User, 
  Tag, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle,
  XCircle,
  Ticket as TicketIcon
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface TicketListProps {
  tickets: Ticket[];
  onAction?: (ticketId: string, action: string) => void;
  userRole: string;
}

export default function TicketList({ tickets, onAction, userRole }: TicketListProps) {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Resolved': return 'bg-gray-500/10 text-gray-400 border-white/5';
      case 'Declined': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-white/5';
    }
  };

  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 bg-[#111112] rounded border border-white/5 border-dashed">
        <div className="bg-white/5 w-12 h-12 rounded flex items-center justify-center mx-auto mb-4">
          <TicketIcon size={24} className="text-gray-600" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">No matching records</h3>
        <p className="text-gray-500 text-xs mt-2">All systems are currently reported as operational.</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent lg:bg-[#111112] lg:border lg:border-white/5 lg:rounded-lg overflow-hidden">
      {/* Mobile view (List of cards) */}
      <div className="lg:hidden space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-[#111112] border border-white/5 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                getStatusColor(ticket.status)
              )}>
                {ticket.status}
              </span>
              <span className="text-[10px] text-gray-600 font-mono">#{ticket.id.slice(0, 5)}</span>
            </div>
            
            <div className="flex items-start gap-4">
              {ticket.image && (
                <button 
                  onClick={() => setSelectedImage(ticket.image)}
                  className="w-12 h-12 rounded overflow-hidden border border-white/10 shrink-0"
                >
                  <img src={ticket.image} className="w-full h-full object-cover" alt="Ticket attachment" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white tracking-tight">{ticket.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ticket.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold tracking-widest">
              <div className="text-gray-500">
                <p className="mb-1 text-gray-700">Location</p>
                <p className="text-gray-400 break-words">{ticket.location}</p>
              </div>
              <div className="text-gray-500">
                <p className="mb-1 text-gray-700">Category</p>
                <p className="text-gray-400">{ticket.category}</p>
              </div>
            </div>

            {(userRole === 'manager' || userRole === 'technician') && (
              <div className="pt-2 flex flex-wrap gap-2">
                {userRole === 'manager' && ticket.status === 'New' && (
                  <>
                    <button 
                      onClick={() => onAction?.(ticket.id, 'Approved')}
                      className="flex-1 px-3 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded uppercase tracking-widest"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => onAction?.(ticket.id, 'Declined')}
                      className="flex-1 px-3 py-2 bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-bold rounded uppercase tracking-widest"
                    >
                      Decline
                    </button>
                  </>
                )}

                {userRole === 'technician' && ticket.status === 'Approved' && (
                  <button 
                    onClick={() => onAction?.(ticket.id, 'In Progress')}
                    className="w-full px-3 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold rounded uppercase tracking-widest"
                  >
                    Accept Task
                  </button>
                )}

                {userRole === 'technician' && ticket.status === 'In Progress' && (
                  <button 
                    onClick={() => onAction?.(ticket.id, 'Resolved')}
                    className="w-full px-3 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded uppercase tracking-widest"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop view (Table) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4 font-bold">Details</th>
              <th className="px-6 py-4 font-bold">Location</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {ticket.image && (
                      <button 
                        onClick={() => setSelectedImage(ticket.image)}
                        className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0 hover:scale-105 transition-transform"
                      >
                        <img src={ticket.image} className="w-full h-full object-cover" alt="Ticket attachment" />
                      </button>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white tracking-tight truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-300">{ticket.location}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{ticket.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                    getStatusColor(ticket.status)
                  )}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {userRole === 'manager' && ticket.status === 'New' && (
                      <>
                        <button 
                          onClick={() => onAction?.(ticket.id, 'Approved')}
                          className="px-2 py-1 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 text-[10px] font-bold rounded transition-colors uppercase tracking-widest"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => onAction?.(ticket.id, 'Declined')}
                          className="px-2 py-1 bg-red-600/10 text-red-500 hover:bg-red-600/20 text-[10px] font-bold rounded transition-colors uppercase tracking-widest"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {userRole === 'technician' && ticket.status === 'Approved' && (
                      <button 
                        onClick={() => onAction?.(ticket.id, 'In Progress')}
                        className="px-2 py-1 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 text-[10px] font-bold rounded transition-colors uppercase tracking-widest"
                      >
                        Accept Task
                      </button>
                    )}

                    {userRole === 'technician' && ticket.status === 'In Progress' && (
                      <button 
                        onClick={() => onAction?.(ticket.id, 'Resolved')}
                        className="px-2 py-1 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 text-[10px] font-bold rounded transition-colors uppercase tracking-widest"
                      >
                        Resolve
                      </button>
                    )}

                    <button className="text-gray-600 hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage} 
            alt="Ticket preview" 
            className="max-w-full max-h-full rounded shadow-2xl border border-white/10" 
          />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white">
            <XCircle size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
