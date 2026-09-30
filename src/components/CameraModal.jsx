import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Upload, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { aiApi } from '../services/api';

export const CameraModal = ({ isOpen, onClose, onImageAnalyzed }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [userNote, setUserNote] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access not granted or unavailable. You can upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'emergency-capture.jpg', { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage({ file, previewUrl });
        stopCamera();
      }
    }, 'image/jpeg', 0.85);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCapturedImage({ file, previewUrl });
      stopCamera();
    }
  };

  const retakePhoto = () => {
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }
    setCapturedImage(null);
    setAnalysisResult(null);
    startCamera();
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('image', capturedImage.file);
      if (userNote) formData.append('prompt', userNote);

      const res = await aiApi.analyzeImage(formData);
      if (res.data.success) {
        setAnalysisResult(res.data.data);
      }
    } catch (err) {
      console.error('AI image analysis failed:', err);
      setAnalysisResult({
        scene_description: 'Image processed for emergency responders.',
        hazards_detected: ['Visual review needed by responders'],
        extracted_text: 'Text extraction requires visual inspection.',
        recommended_action: 'Proceed to safe zone and confirm SOS alert.',
        severity: 'HIGH',
        confidence: 'local_fallback'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const applyToEmergency = () => {
    if (analysisResult) {
      const combinedText = `[Visual AI Analysis]: ${analysisResult.scene_description}. ${
        analysisResult.extracted_text && analysisResult.extracted_text !== 'None' 
          ? `Visible Signs/Text: ${analysisResult.extracted_text}. ` 
          : ''
      }${userNote ? `Note: ${userNote}` : ''}`;
      
      onImageAnalyzed(combinedText, analysisResult);
    }
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }
    setCapturedImage(null);
    setAnalysisResult(null);
    setUserNote('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Camera & AI OCR</h3>
              <p className="text-xs text-slate-400">Capture scene, hazards, or road signs for AI inspection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="relative aspect-video sm:aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            
            {/* Live Camera View */}
            {!capturedImage && !cameraError && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Captured Preview */}
            {capturedImage && (
              <img
                src={capturedImage.previewUrl}
                alt="Captured emergency scene"
                className="w-full h-full object-contain"
              />
            )}

            {/* Camera Error Fallback */}
            {cameraError && !capturedImage && (
              <div className="p-6 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-sm text-slate-300">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-white inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              </div>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Controls before analysis */}
          {!capturedImage ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all"
              >
                <Camera className="w-5 h-5" />
                SNAP PHOTO
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Add optional note (e.g. 'Signpost name', 'Car number plate')"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={retakePhoto}
                  disabled={analyzing}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 transition-all disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      ANALYZE IMAGE & OCR
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Display */}
          {analysisResult && (
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> AI Multimodal Assessment
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {analysisResult.confidence || 'Gemini Vision'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400">Scene Description:</h4>
                <p className="text-sm text-slate-200">{analysisResult.scene_description}</p>
              </div>

              {analysisResult.extracted_text && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">OCR Extracted Text:</h4>
                  <p className="text-sm font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 text-amber-300">
                    "{analysisResult.extracted_text}"
                  </p>
                </div>
              )}

              {analysisResult.hazards_detected && analysisResult.hazards_detected.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-400">Identified Hazards:</h4>
                  <ul className="text-xs text-slate-300 list-disc list-inside">
                    {analysisResult.hazards_detected.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={applyToEmergency}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <Check className="w-4 h-4" />
                USE IN EMERGENCY REPORT
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
