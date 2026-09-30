import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle } from 'lucide-react';

export const LocationBadge = ({ onLocationChange }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        };
        setLocation(loc);
        setLoading(false);
        if (onLocationChange) {
          onLocationChange(loc);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError('Location unavailable. GPS permission may be required.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${location ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          {location ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                GPS Active: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                ±{location.accuracy}m
              </span>
            </div>
          ) : error ? (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 inline" /> {error}
            </span>
          ) : (
            <span className="text-slate-400">Detecting satellite GPS coordinates...</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={fetchLocation}
        disabled={loading}
        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors text-[11px]"
        title="Refresh GPS Coordinates"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Locating...' : 'Refresh GPS'}</span>
      </button>
    </div>
  );
};
