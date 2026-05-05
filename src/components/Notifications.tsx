import React from 'react';
import { Bell, CheckCircle2, Clock, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface NotificationsProps {
  notifications: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Notifications({ notifications, isOpen, onClose }: NotificationsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed sm:absolute top-16 right-4 left-4 sm:left-auto sm:right-8 w-auto sm:w-80 bg-[#111112] border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col max-h-[400px] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Bell size={12} className="text-blue-500" /> Notifications
              </h3>
              <span className="text-[9px] font-bold text-gray-500 uppercase">{notifications.length} Total</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-white/[0.02] transition-colors cursor-default">
                      <p className="text-xs text-gray-300 leading-snug">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={10} className="text-gray-600" />
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                          {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 text-center">
                  <Terminal size={24} className="mx-auto text-gray-800 mb-2" />
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">System Clear</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
