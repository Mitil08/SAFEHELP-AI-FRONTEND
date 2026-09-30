import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { LocationBadge } from '../components/LocationBadge';
import { CameraModal } from '../components/CameraModal';
import { StructuredEmergencyCard } from '../components/StructuredEmergencyCard';
import { aiApi, sosApi } from '../services/api';
import { 
  Camera, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  LifeBuoy, 
  CheckCircle,
  PhoneCall,
  Clock
} from 'lucide-react';

export const HomePage = () => {
  const [emergencyText, setEmergencyText] = useState('');
  const [location, setLocation] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [structuredData, setStructuredData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // Voice transcript receiver
  const handleVoiceTranscript = (transcript) => {
    setEmergencyText(prev => prev ? `${prev} ${transcript}` : transcript);
  };

  // Image analysis receiver from CameraModal
  const handleImageAnalyzed = (textFromImage, analysisObj) => {
    setEmergencyText(prev => prev ? `${prev}\n${textFromImage}` : textFromImage);
    if (analysisObj) {
      setStructuredData({
        incident_type: analysisObj.incident_type || 'General Emergency',
        severity: analysisObj.severity || 'HIGH',
        people_involved: 1,
        injury_reported: false,
        hazard_reported: (analysisObj.hazards_detected && analysisObj.hazards_detected.length > 0),
        ai_summary: analysisObj.scene_description,
        recommended_action: analysisObj.recommended_action
      });
    }
  };

  // Trigger AI analysis on text / speech
  const handleAnalyzeEmergency = async () => {
    if (!emergencyText.trim()) {
      setErrorMessage('Please describe the emergency by voice or text first.');
      return;
    }
    setErrorMessage('');
    setAnalyzing(true);

    try {
      const res = await aiApi.analyzeText(emergencyText.trim());
      if (res.data.success) {
        setStructuredData(res.data.data);
      }
    } catch (err) {
      console.warn('AI analysis error, providing immediate triage structure:', err);
      // Fallback emergency structure
      setStructuredData({
        incident_type: 'Immediate Emergency Assistance',
        severity: 'HIGH',
        people_involved: 1,
        injury_reported: true,
        hazard_reported: false,
        ai_summary: emergencyText,
        recommended_action: 'Remain in a secure place. Dispatching emergency notification.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Confirm and create SOS event
  const handleConfirmSos = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        incident_type: structuredData?.incident_type || 'Emergency',
        severity: structuredData?.severity || 'HIGH',
        people_involved: structuredData?.people_involved || 1,
        injury_reported: structuredData?.injury_reported || false,
        hazard_reported: structuredData?.hazard_reported || false,
        ai_summary: structuredData?.ai_summary || emergencyText || 'Emergency alert triggered',
        recommended_action: structuredData?.recommended_action || 'Emergency services requested',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_accuracy: location?.accuracy || null,
        status: 'ACTIVE'
      };

      const res = await sosApi.create(payload);
      if (res.data.success) {
        setSuccessAlert({
          id: res.data.data.id,
          message: 'SOS created successfully.'
        });
        // Clear inputs
        setEmergencyText('');
        setStructuredData(null);
      }
    } catch (err) {
      console.error('Failed to create SOS:', err);
      setErrorMessage('Failed to create SOS alert. Please try again or call emergency numbers directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Tap Instant SOS without pre-analysis (for extreme panic/immediate danger)
  const handleInstantSos = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        incident_type: 'Immediate Urgent Distress',
        severity: 'CRITICAL',
        people_involved: 1,
        injury_reported: false,
        hazard_reported: true,
        ai_summary: emergencyText ? emergencyText : 'Urgent SOS button activated by user.',
        recommended_action: 'Seek shelter and await emergency responder contact.',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_accuracy: location?.accuracy || null,
        status: 'ACTIVE'
      };

      const res = await sosApi.create(payload);
      if (res.data.success) {
        setSuccessAlert({
          id: res.data.data.id,
          message: 'SOS created successfully.'
        });
        setEmergencyText('');
      }
    } catch (err) {
      console.error('Instant SOS failed:', err);
      setErrorMessage('Failed to create instant SOS alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Title & Tagline */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          SAFEHELP <span className="text-rose-500">AI</span>
        </h1>
        <p className="text-lg sm:text-xl font-medium text-slate-300">
          Need help? Tell us what happened.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successAlert && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 space-y-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base text-white">{successAlert.message}</h3>
              <p className="text-xs text-emerald-300">
                Your incident record has been posted to the emergency responder dashboard.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-800">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              View in Emergency Dashboard
            </button>
            <button
              onClick={() => setSuccessAlert(null)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600 text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Voice Input Button */}
      <VoiceInputButton onTranscript={handleVoiceTranscript} />

      <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
        <span className="h-px bg-slate-800 flex-1" />
        <span>OR TYPE EMERGENCY</span>
        <span className="h-px bg-slate-800 flex-1" />
      </div>

      {/* Section 2: Text Input Area */}
      <div className="space-y-3">
        <label htmlFor="emergency-input" className="block text-sm font-semibold text-slate-300">
          Emergency Description (Editable):
        </label>
        <textarea
          id="emergency-input"
          rows={4}
          value={emergencyText}
          onChange={(e) => setEmergencyText(e.target.value)}
          placeholder="Describe what happened... (e.g., 'My friend and I had an accident on the highway. He is injured and we need help.')"
          className="w-full p-4 rounded-2xl bg-slate-900 border-2 border-slate-800 focus:border-rose-500 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-0 transition-colors shadow-inner"
        />

        {/* Quick sample chips for panic / accessibility */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick options:</span>
          <button
            type="button"
            onClick={() => setEmergencyText('Car collision on road, airbags deployed, driver injured.')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            🚗 Car Collision
          </button>
          <button
            type="button"
            onClick={() => setEmergencyText('Sudden severe chest pain and difficulty breathing.')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            🫁 Medical / Breathing
          </button>
          <button
            type="button"
            onClick={() => setEmergencyText('Building fire observed, heavy smoke blocking exit.')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            🔥 Fire Hazard
          </button>
        </div>
      </div>

      {/* Section 3: GPS Location Badge */}
      <LocationBadge onLocationChange={(loc) => setLocation(loc)} />

      {/* Action Buttons: Camera & AI Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Open Camera Modal */}
        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md group"
        >
          <Camera className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span>📷 ANALYZE IMAGE / OCR</span>
        </button>

        {/* Trigger AI Analysis */}
        <button
          type="button"
          onClick={handleAnalyzeEmergency}
          disabled={analyzing || !emergencyText.trim()}
          className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 border-2 border-slate-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md group"
        >
          <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>{analyzing ? 'ANALYZING...' : 'ANALYZE EMERGENCY'}</span>
        </button>

      </div>

      {/* Structured Information Card if AI analyzed */}
      {structuredData && (
        <StructuredEmergencyCard
          structuredData={structuredData}
          location={location}
          onConfirmSos={handleConfirmSos}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Prominent Direct SOS / HELP Button */}
      <div className="pt-4 border-t border-slate-800/80 text-center space-y-4">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Immediate Danger? One-Tap Emergency Dispatch
        </p>

        <button
          type="button"
          onClick={handleInstantSos}
          disabled={isSubmitting}
          className="w-full sm:w-80 mx-auto py-6 px-8 rounded-3xl bg-gradient-to-tr from-rose-700 via-red-600 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-2xl tracking-widest flex items-center justify-center gap-3 shadow-2xl sos-glow transition-all transform active:scale-95 disabled:opacity-50"
        >
          <LifeBuoy className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
          <span>🆘 SOS HELP</span>
        </button>
        
        <p className="text-[11px] text-slate-500">
          Sends your GPS location and emergency alerts directly to the responder dashboard.
        </p>
      </div>

      {/* Camera Modal Component */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageAnalyzed={handleImageAnalyzed}
      />

    </div>
  );
};
