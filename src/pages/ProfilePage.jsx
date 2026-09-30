import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { contactApi } from '../services/api';
import { 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactApi.getAll();
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Contact name and phone number are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await contactApi.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined
      });
      if (res.data.success) {
        setContacts(prev => [res.data.data, ...prev]);
        setName('');
        setPhone('');
        setEmail('');
      }
    } catch (err) {
      console.error('Failed to add contact:', err);
      setError('Failed to add emergency contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await contactApi.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-rose-900/30">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name || 'SafeHelp User'}</h1>
            <p className="text-sm text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Account</span>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-500" />
              Emergency Contacts
            </h2>
            <p className="text-xs text-slate-400">
              Trusted guardians or friends linked to your crisis alerts
            </p>
          </div>
        </div>

        {/* Add Contact Card */}
        <form onSubmit={handleAddContact} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Add New Contact</h3>
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mom / Brother / Dr. Smith"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-900/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Adding...' : 'Save Emergency Contact'}</span>
            </button>
          </div>
        </form>

        {/* Contacts List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
              <PhoneCall className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">No emergency contacts saved yet.</p>
              <p className="text-xs text-slate-500">Add trusted contacts above so they can be dispatched during crises.</p>
            </div>
          ) : (
            contacts.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-white text-base">{c.name}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-emerald-400 hover:underline">
                      <Phone className="w-3.5 h-3.5" /> {c.phone}
                    </a>
                    {c.email && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
