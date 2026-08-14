import React, { useState } from 'react';
import { X, UserPlus, Share2, Building, Mail, Briefcase, Crown } from 'lucide-react';

export default function AddContactModal({ isOpen, onClose, onAdd, contacts = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    companyName: '',
    referrerName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd(formData);
      setFormData({ name: '', email: '', title: '', companyName: '', referrerName: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 relative border border-amber-500/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl gradient-gold-bg text-amber-950 shadow-md shadow-amber-500/30 border border-amber-200/50">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-accent font-extrabold text-amber-300 uppercase tracking-wide">Add Contact & Referral Link</h2>
              <p className="text-xs text-amber-200/70 font-medium">Creates Contact node & optional :REFERRED relationship</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-200/70 hover:text-white hover:bg-amber-950/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold font-accent text-amber-200 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/70 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-accent text-amber-200 uppercase tracking-wider mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="jordan@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/70 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-accent text-amber-200 uppercase tracking-wider mb-1">Title / Role</label>
              <input
                type="text"
                placeholder="e.g. VP of Operations"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-accent text-amber-200 uppercase tracking-wider mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Nexus Tech"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-black/70 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-amber-50 placeholder-amber-200/40 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-accent text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              Referred By (Graph Connection)
            </label>
            <select
              value={formData.referrerName}
              onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
              className="w-full bg-black/80 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-amber-50 focus:outline-none focus:border-amber-400 transition"
            >
              <option value="">-- No Referrer (Direct Lead) --</option>
              {contacts.map((c, idx) => (
                <option key={idx} value={c.name} className="bg-slate-950 text-amber-100">
                  {c.name} ({c.title || 'Contact'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-amber-500/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-200/80 hover:text-white bg-black/60 border border-amber-500/30 hover:bg-amber-950/60 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-extrabold gradient-gold-bg text-amber-950 hover-gold-glow shadow-lg shadow-amber-500/30 border border-amber-200/50 transition"
            >
              {isSubmitting ? 'Adding Contact...' : 'Save to Graph DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
