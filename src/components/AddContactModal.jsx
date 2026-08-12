import React, { useState } from 'react';
import { X, UserPlus, Share2, Building, Mail, Briefcase } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 relative border border-slate-700/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl gradient-bg text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Contact & Referral Link</h2>
              <p className="text-xs text-slate-400">Creates Contact node & optional :REFERRED relationship</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="jordan@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Role</label>
              <input
                type="text"
                placeholder="e.g. VP of Operations"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Nexus Tech"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              Referred By (Graph Connection)
            </label>
            <select
              value={formData.referrerName}
              onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">-- No Referrer (Direct Lead) --</option>
              {contacts.map((c, idx) => (
                <option key={idx} value={c.name}>
                  {c.name} ({c.title || 'Contact'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold gradient-bg text-white hover-glow shadow-lg transition"
            >
              {isSubmitting ? 'Adding Contact...' : 'Save to Graph DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
