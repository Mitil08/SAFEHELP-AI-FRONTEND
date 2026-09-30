import React, { useState, useEffect } from 'react';
import { sosApi } from '../services/api';
import { 
  Activity, 
  RefreshCw, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  User, 
  CheckCircle2, 
  Navigation, 
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { speakText } = useAccessibility();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await sosApi.getAll();
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load SOS events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Polling every 15s for live emergency updates
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await sosApi.updateStatus(id, status);
      if (res.data.success) {
        setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status, resolved_at: status === 'RESOLVED' ? new Date().toISOString() : ev.resolved_at } : ev));
        if (selectedEvent && selectedEvent.id === id) {
          setSelectedEvent(prev => ({ ...prev, status }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEvents = events.filter(e => {
    if (filterStatus === 'ALL') return true;
    return e.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> ACTIVE SOS
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> DISPATCHED
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity) => {
    const map = {
      CRITICAL: 'bg-rose-600 text-white font-black',
      HIGH: 'bg-orange-500 text-white font-bold',
      MEDIUM: 'bg-amber-500 text-black font-bold',
      LOW: 'bg-slate-700 text-slate-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] tracking-wide uppercase ${map[severity] || map.HIGH}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Emergency Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Live alert feed for designated emergency contacts & crisis responders
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['ALL', 'ACTIVE', 'DISPATCHED', 'RESOLVED'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterStatus === s 
                    ? 'bg-slate-750 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Alert List + Detailed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {loading && events.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2 bg-slate-900/60 rounded-3xl border border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-600" />
              <p>Scanning active emergency transmissions...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-900/60 rounded-3xl border border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-white text-lg">No incidents matching filter</h3>
              <p className="text-xs text-slate-400">All emergency channels clear for this status.</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedEvent?.id === event.id
                    ? 'bg-slate-850 border-rose-500 shadow-xl shadow-rose-950/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.status)}
                    {getSeverityBadge(event.severity)}
                    <span className="text-sm font-bold text-white">{event.incident_type}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm text-slate-200 line-clamp-2 mb-3 font-medium">
                  {event.ai_summary || 'No summary text provided.'}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {event.users?.name ? (
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-rose-400" /> {event.users.name}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Guest SOS</span>
                    )}

                    {event.latitude && event.longitude && (
                      <span className="flex items-center gap-1 text-emerald-400 font-mono">
                        <MapPin className="w-3.5 h-3.5" /> GPS Linked
                      </span>
                    )}
                  </div>

                  <span className="text-rose-400 text-xs font-semibold hover:underline">
                    View incident triage →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Incident Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <div className="sticky top-20 bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getSeverityBadge(selectedEvent.severity)}
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                  <h3 className="font-black text-lg text-white">{selectedEvent.incident_type}</h3>
                  <p className="text-xs text-slate-400">
                    Logged at {new Date(selectedEvent.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Responder / Sender info */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sender Info</span>
                <p className="text-sm font-bold text-white">{selectedEvent.users?.name || 'Anonymous Emergency Sender'}</p>
                {selectedEvent.users?.email && (
                  <p className="text-xs text-slate-300 font-mono">{selectedEvent.users.email}</p>
                )}
              </div>

              {/* AI Incident Summary */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase text-slate-400">Summary</h4>
                <p className="text-sm text-slate-200 bg-slate-800/50 p-3 rounded-xl border border-slate-800 font-medium">
                  {selectedEvent.ai_summary}
                </p>
              </div>

              {/* Recommended Action */}
              {selectedEvent.recommended_action && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Responder Advice
                  </h4>
                  <p className="text-xs text-rose-100 bg-rose-950/30 p-3 rounded-xl border border-rose-900/50 font-medium">
                    {selectedEvent.recommended_action}
                  </p>
                </div>
              )}

              {/* GPS Coordinates & Google Maps Link */}
              {selectedEvent.latitude && selectedEvent.longitude ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">GPS Location</span>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 block">
                        {selectedEvent.latitude.toFixed(6)}, {selectedEvent.longitude.toFixed(6)}
                      </span>
                      {selectedEvent.location_accuracy && (
                        <span className="text-[10px] text-slate-400">
                          Accuracy: ±{selectedEvent.location_accuracy}m
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${selectedEvent.latitude},${selectedEvent.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No GPS coordinates attached to this incident.</p>
              )}

              {/* Action Buttons: Status updates */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 block">Update Status</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEvent.id, 'DISPATCHED')}
                    disabled={updatingId === selectedEvent.id || selectedEvent.status === 'DISPATCHED'}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                  >
                    Mark Dispatched
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedEvent.id, 'RESOLVED')}
                    disabled={updatingId === selectedEvent.id || selectedEvent.status === 'RESOLVED'}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">Select an incident</p>
              <p className="text-xs text-slate-500">Click any emergency alert on the left to inspect location, severity, and responder options.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
