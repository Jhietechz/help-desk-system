import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TicketFormProps {
  onSuccess: () => void;
}

export default function TicketForm({ onSuccess }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Networking');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Networking', 'Hardware', 'Software', 'Electrical', 'Other'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/tickets', 
        { title, description, category, location, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ticket submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Support / <span className="text-gray-500 font-normal">Report New Incident</span></h2>
        <p className="text-gray-500 text-sm mt-1">Provide clear details for faster resolution by our technical team.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        <div className="md:col-span-8 bg-[#111112] p-8 rounded-lg border border-white/5 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Issue Headline</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-700"
                placeholder="Briefly state the problem..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all appearance-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Location/Building</label>
                <input
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-700"
                  placeholder="e.g. Science Block, R102"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Description</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded text-sm text-white focus:border-blue-500 focus:outline-none transition-all resize-none placeholder:text-gray-700"
                placeholder="Describe exactly what's wrong..."
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-[#111112] p-6 rounded-lg border border-white/5">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Supporting Visuals</h3>
            
            <div className="relative group">
              {image ? (
                <div className="relative aspect-video rounded overflow-hidden border border-white/10 mb-4">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded border border-dashed border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer mb-4">
                  <div className="bg-white/5 p-3 rounded-full mb-2">
                    <ImageIcon className="text-gray-500" size={24} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Upload Image</p>
                  <p className="text-[10px] text-gray-600 mt-1">JPG, PNG (Max 2MB)</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            
            <p className="text-[10px] text-gray-600 leading-relaxed italic">
              * Photos help our technicians identify hardware faults much faster.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded text-xs font-bold transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Lodge Formal Ticket'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
