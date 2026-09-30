import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export const VoiceInputButton = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs text-center justify-center">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Voice input is not supported by this browser. Please use text input below.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
        className={`relative group w-full py-8 px-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
          isListening
            ? 'bg-rose-950/80 border-rose-500 shadow-2xl shadow-rose-900/60 animate-pulse'
            : 'bg-slate-900/90 border-slate-700 hover:border-rose-500/80 hover:bg-slate-850 shadow-lg'
        }`}
      >
        {/* Pulsing visual circles when listening */}
        {isListening && (
          <span className="absolute inset-0 rounded-2xl border-2 border-rose-500 animate-ping opacity-30" />
        )}

        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
          isListening ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-500 border border-slate-700'
        }`}>
          {isListening ? (
            <Mic className="w-8 h-8 animate-bounce" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </div>

        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-white tracking-wide">
            {isListening ? 'LISTENING... TAP TO FINISH' : 'TAP TO SPEAK EMERGENCY'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isListening ? 'Speak clearly into your microphone' : 'Voice is transcribed into editable text automatically'}
          </p>
        </div>
      </button>
    </div>
  );
};
