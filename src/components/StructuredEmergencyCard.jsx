import React from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Users, 
  HeartPulse, 
  Flame, 
  Volume2, 
  CheckCircle, 
  Send,
  MapPin
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const StructuredEmergencyCard = ({ 
  structuredData, 
  location, 
  onConfirmSos, 
  isSubmitting = false 
}) => {
  const { speakText } = useAccessibility();

  if (!structuredData) return null;

  const severityColors = {
    CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  };

  const handleReadAloud = () => {
    const textToRead = `Emergency status: ${structuredData.severity}. ${structuredData.incident_type}. Summary: ${structuredData.ai_summary}. Immediate recommended action: ${structuredData.recommended_action}`;
    speakText(textToRead);
  };

  return (
    <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-rose-950/40 space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-900/40">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide">
              STRUCTURED EMERGENCY REPORT
            </h3>
            <p className="text-xs text-slate-400">
              AI-triaged for rapid emergency dispatch & responders
            </p>
          </div>
        </div>

        {/* Voice Read Aloud Button */}
        <button
          type="button"
          onClick={handleReadAloud}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          title="Read instructions aloud"
        >
          <Volume2 className="w-4 h-4 text-rose-400" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* Grid of Triaged Facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Severity */}
        <div className={`p-3 rounded-2xl border ${severityColors[structuredData.severity] || severityColors.HIGH}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Severity</span>
          <span className="text-base font-black tracking-wide">{structuredData.severity}</span>
        </div>

        {/* Incident Type */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Incident Type</span>
          <span className="text-sm font-bold text-white truncate block">{structuredData.incident_type || 'Emergency'}</span>
        </div>

        {/* People Involved */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">People</span>
            <span className="text-base font-bold text-white">{structuredData.people_involved || 1}</span>
          </div>
          <Users className="w-5 h-5 text-slate-500" />
        </div>

        {/* Injury & Hazard Flags */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Injury
            </span>
            <span className={`font-bold ${structuredData.injury_reported ? 'text-rose-400' : 'text-slate-400'}`}>
              {structuredData.injury_reported ? 'YES' : 'NO'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Hazard
            </span>
            <span className={`font-bold ${structuredData.hazard_reported ? 'text-orange-400' : 'text-slate-400'}`}>
              {structuredData.hazard_reported ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Situation Summary</h4>
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {structuredData.ai_summary}
        </p>
      </div>

      {/* Recommended Action */}
      {structuredData.recommended_action && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Immediate Recommended Action
          </h4>
          <p className="text-sm sm:text-base text-rose-100 font-medium leading-relaxed">
            {structuredData.recommended_action}
          </p>
        </div>
      )}

      {/* Attached GPS Coordinates */}
      {location && (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Attached GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} (±{location.accuracy}m accuracy)</span>
        </div>
      )}

      {/* Confirmation & SOS Dispatch Button */}
      <button
        type="button"
        onClick={onConfirmSos}
        disabled={isSubmitting}
        className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-lg tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-rose-900/60 transition-all transform active:scale-98 disabled:opacity-50"
      >
        <Send className="w-6 h-6 animate-pulse" />
        <span>{isSubmitting ? 'DISPATCHING SOS...' : 'CONFIRM & SEND SOS ALERT'}</span>
      </button>
    </div>
  );
};
