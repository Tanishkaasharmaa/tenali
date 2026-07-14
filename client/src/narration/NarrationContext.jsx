import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getStaticAudioPath, getTokenAudioPath } from './AudioCatalog';

const NarrationContext = createContext();

export const NarrationProvider = ({ children }) => {
  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      return localStorage.getItem('tenali-autoplay') === 'true';
    } catch {
      return false;
    }
  });

  const [speed, setSpeed] = useState(() => {
    try {
      return parseFloat(localStorage.getItem('tenali-narration-speed')) || 1.0;
    } catch {
      return 1.0;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingText, setCurrentlyPlayingText] = useState('');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState('');

  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    try {
      return localStorage.getItem('tenali-narration-voice-name') || '';
    } catch {
      return '';
    }
  });

  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const motivationTimeoutRef = useRef(null);

  // Initialize HTML5 Audio element on mount
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load and manage SpeechSynthesis voices, auto-selecting a sweet human-like female/natural voice by default
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter to English voices
      const enVoices = allVoices.filter(v => 
        v.lang.startsWith('en') || 
        v.lang.includes('EN') || 
        v.lang.includes('en-')
      );
      setVoices(enVoices);

      let voiceName = localStorage.getItem('tenali-narration-voice-name') || '';
      const voiceExists = enVoices.some(v => v.name === voiceName);

      if (!voiceExists) {
        // Priority list for sweet / natural human-like English voices
        // 1. Edge/Chrome online/natural female voices (Aria, Jenny, Sonia, Emily)
        const sweetFemaleKeywords = ['aria', 'jenny', 'sonia', 'emily', 'natural', 'neural', 'online', 'sweet'];
        const rank1 = enVoices.filter(v => 
          sweetFemaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
          !v.name.toLowerCase().includes('guy') && 
          !v.name.toLowerCase().includes('male')
        );
        
        if (rank1.length > 0) {
          voiceName = rank1[0].name;
        } else {
          // 2. Google female voices
          const googleFemale = enVoices.filter(v => 
            v.name.toLowerCase().includes('google') &&
            !v.name.toLowerCase().includes('male')
          );
          if (googleFemale.length > 0) {
            voiceName = googleFemale[0].name;
          } else {
            // 3. MacOS/Windows standard female voices (Samantha, Zira, Hazel, Susan, Heera)
            const femaleNames = ['samantha', 'zira', 'hazel', 'susan', 'heera', 'female', 'jenny', 'zoira', 'veena'];
            const rank3 = enVoices.filter(v => 
              femaleNames.some(name => v.name.toLowerCase().includes(name))
            );
            if (rank3.length > 0) {
              voiceName = rank3[0].name;
            } else {
              // 4. Any English female voice
              const rank4 = enVoices.filter(v => v.name.toLowerCase().includes('female'));
              if (rank4.length > 0) {
                voiceName = rank4[0].name;
              } else {
                // 5. Default English voice
                const defaultVoice = enVoices.find(v => v.default) || enVoices[0];
                voiceName = defaultVoice ? defaultVoice.name : '';
              }
            }
          }
        }
        
        if (voiceName) {
          try {
            localStorage.setItem('tenali-narration-voice-name', voiceName);
          } catch {}
        }
      }
      setSelectedVoiceName(voiceName);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const getSelectedVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const allVoices = window.speechSynthesis.getVoices();
    return allVoices.find(v => v.name === selectedVoiceName) || null;
  };

  const getMotivationalVoice = (mainVoice) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const allVoices = window.speechSynthesis.getVoices();
    const enVoices = allVoices.filter(v => 
      v.lang.startsWith('en') || 
      v.lang.includes('EN') || 
      v.lang.includes('en-')
    );
    
    // Explicitly prioritize Microsoft Zira voice for motivating words as requested
    const ziraVoice = enVoices.find(v => v.name.toLowerCase().includes('zira'));
    if (ziraVoice) return ziraVoice;

    // Fallback: Find a sweet natural female/neural voice that is DIFFERENT from the main voice
    const sweetFemaleKeywords = ['aria', 'jenny', 'sonia', 'emily', 'natural', 'neural', 'online', 'sweet'];
    const otherSweetVoices = enVoices.filter(v => 
      v.name !== (mainVoice ? mainVoice.name : '') &&
      sweetFemaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
      !v.name.toLowerCase().includes('guy') && 
      !v.name.toLowerCase().includes('male')
    );
    if (otherSweetVoices.length > 0) return otherSweetVoices[0];

    // Fallback: Or Google voices
    const otherGoogleVoices = enVoices.filter(v => 
      v.name !== (mainVoice ? mainVoice.name : '') &&
      v.name.toLowerCase().includes('google') &&
      !v.name.toLowerCase().includes('male')
    );
    if (otherGoogleVoices.length > 0) return otherGoogleVoices[0];

    // Fallback: Or standard female names
    const femaleNames = ['samantha', 'hazel', 'susan', 'heera', 'female', 'jenny', 'zoira', 'veena'];
    const otherFemaleVoices = enVoices.filter(v => 
      v.name !== (mainVoice ? mainVoice.name : '') &&
      femaleNames.some(name => v.name.toLowerCase().includes(name))
    );
    if (otherFemaleVoices.length > 0) return otherFemaleVoices[0];

    // Fallback to any different English voice
    const anyOtherVoice = enVoices.find(v => v.name !== (mainVoice ? mainVoice.name : ''));
    return anyOtherVoice || mainVoice;
  };

  // Sync autoPlay settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tenali-autoplay', autoPlay ? 'true' : 'false');
    } catch {}
  }, [autoPlay]);

  // Sync speed settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tenali-narration-speed', String(speed));
    } catch {}
    // If audio is currently playing, adjust its speed immediately
    if (audioRef.current && isPlaying) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed, isPlaying]);

  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentlyPlayingText('');
    setCurrentlyPlayingId('');
    queueRef.current = [];
    queueIndexRef.current = 0;
  };

  const playNarration = (text, contentId = '') => {
    stopNarration();
    if (!text && !contentId) return;

    // Clean up feedback speech text: omit equation/solution steps from verbal feedback, only say the header word.
    let processedText = text;
    if (contentId && contentId.startsWith('fb_')) {
      if (text.startsWith('Correct')) {
        processedText = 'Correct!';
      } else if (text.startsWith('Incorrect')) {
        processedText = 'Incorrect.';
      } else if (text.startsWith('Skipped')) {
        processedText = 'Skipped.';
      }
    }

    // Helper: TTS speaker function with custom pitch support
    const speakText = (txt, rate, pitch = 1.0, callback = null) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        if (callback) callback();
        return;
      }
      
      // Clean up symbols and newlines that SpeechSynthesis might not read well
      let cleanText = txt
        .replace(/\r?\n/g, ' ')
        .replace(/×/g, ' times ')
        .replace(/\*/g, ' times ')
        .replace(/÷/g, ' divided by ')
        .replace(/\//g, ' divided by ')
        .replace(/[−-]/g, ' minus ')
        .replace(/=/g, ' equals ')
        .replace(/\?/g, ' what ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voice = getSelectedVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentlyPlayingText(txt);
        setCurrentlyPlayingId(contentId);
      };

      utterance.onend = () => {
        if (callback) {
          callback();
        } else {
          setIsPlaying(false);
          setCurrentlyPlayingText('');
          setCurrentlyPlayingId('');
        }
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        if (callback) {
          callback();
        } else {
          setIsPlaying(false);
          setCurrentlyPlayingText('');
          setCurrentlyPlayingId('');
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    // Helper: Sequence correct answer explanation first, then warm motivation speech synchronously
    const speakIncorrectSequence = (txt, rate) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      // 1. Clean up explanation text
      let cleanText = txt
        .replace(/\r?\n/g, ' ')
        .replace(/×/g, ' times ')
        .replace(/\*/g, ' times ')
        .replace(/÷/g, ' divided by ')
        .replace(/\//g, ' divided by ')
        .replace(/[−-]/g, ' minus ')
        .replace(/=/g, ' equals ')
        .replace(/\?/g, ' what ');

      const utterance1 = new SpeechSynthesisUtterance(cleanText);
      utterance1.rate = rate;
      utterance1.pitch = 1.0;

      // 2. Motivational phrase
      const motivations = [
        "Dont Give Up! You have enough time to progress",
        "just keep trying no problem"
      ];
      const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
      const utterance2 = new SpeechSynthesisUtterance(randomMotivation);
      utterance2.rate = rate * 0.95;
      utterance2.pitch = 1.25;

      const mainVoice = getSelectedVoice();
      const motivationalVoice = getMotivationalVoice(mainVoice);
      if (mainVoice) {
        utterance1.voice = mainVoice;
      }
      if (motivationalVoice) {
        utterance2.voice = motivationalVoice;
      } else if (mainVoice) {
        utterance2.voice = mainVoice;
      }

      utterance1.onstart = () => {
        setIsPlaying(true);
        setCurrentlyPlayingText(txt);
        setCurrentlyPlayingId(contentId);
      };

      utterance2.onstart = () => {
        setCurrentlyPlayingText(randomMotivation);
      };

      utterance2.onend = () => {
        setIsPlaying(false);
        setCurrentlyPlayingText('');
        setCurrentlyPlayingId('');
      };

      utterance2.onerror = (e) => {
        console.warn("Utterance2 error:", e);
        setIsPlaying(false);
        setCurrentlyPlayingText('');
        setCurrentlyPlayingId('');
      };

      window.speechSynthesis.speak(utterance1);
      window.speechSynthesis.speak(utterance2);
    };

    // Helper: Play static file directly if matching ID exists and is a feedback chime
    const isFeedbackSound = contentId && contentId.startsWith('fb_');
    if (isFeedbackSound && getStaticAudioPath(contentId)) {
      setCurrentlyPlayingText(processedText);
      setCurrentlyPlayingId(contentId);
      setIsPlaying(true);

      const audio = audioRef.current;
      if (!audio) return;

      const path = getStaticAudioPath(contentId);
      audio.src = path;
      audio.playbackRate = speed;

      const playCorrectnessSequence = () => {
        if (!processedText) {
          setIsPlaying(false);
          setCurrentlyPlayingText('');
          setCurrentlyPlayingId('');
          return;
        }

        if (contentId === 'fb_incorrect') {
          speakIncorrectSequence(processedText, speed);
        } else {
          speakText(processedText, speed, 1.0);
        }
      };

      audio.onended = playCorrectnessSequence;
      audio.onerror = () => {
        console.warn(`Failed to play static audio for ID: ${contentId}`);
        playCorrectnessSequence();
      };
      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
        playCorrectnessSequence();
      });
      return;
    }

    // Default: Web Speech API fallback for dynamic text, questions, and intros
    if (processedText) {
      if (contentId === 'fb_incorrect') {
        speakIncorrectSequence(processedText, speed);
      } else {
        speakText(processedText, speed, 1.0);
      }
    }
  };

  return (
    <NarrationContext.Provider
      value={{
        autoPlay,
        toggleAutoPlay: () => setAutoPlay(prev => !prev),
        speed,
        setSpeed,
        isPlaying,
        currentlyPlayingText,
        currentlyPlayingId,
        playNarration,
        stopNarration,
        voices,
        selectedVoiceName,
        setSelectedVoiceName: (name) => {
          setSelectedVoiceName(name);
          try {
            localStorage.setItem('tenali-narration-voice-name', name);
          } catch {}
        }
      }}
    >
      {children}
    </NarrationContext.Provider>
  );
};

export const useNarration = () => {
  const context = useContext(NarrationContext);
  if (!context) {
    throw new Error('useNarration must be used within a NarrationProvider');
  }
  return context;
};
