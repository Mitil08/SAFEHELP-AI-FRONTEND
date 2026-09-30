import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('safehelp_high_contrast') === 'true'
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('safehelp_font_size') || 'normal'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync high contrast to DOM body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('safehelp_high_contrast', highContrast);
  }, [highContrast]);

  // Sync font size to DOM body
  useEffect(() => {
    document.body.classList.remove('font-large', 'font-xlarge');
    if (fontSize === 'large') {
      document.body.classList.add('font-large');
    } else if (fontSize === 'xlarge') {
      document.body.classList.add('font-xlarge');
    }
    localStorage.setItem('safehelp_font_size', fontSize);
  }, [fontSize]);

  // Voice Output (SpeechSynthesis API)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // cancel any active speech
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleContrast = () => setHighContrast(prev => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleContrast,
        fontSize,
        setFontSize,
        speakText,
        stopSpeaking,
        isSpeaking
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
