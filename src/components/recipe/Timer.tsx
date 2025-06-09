import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, Volume2 } from 'lucide-react';

interface TimerProps {
  minutes: number;
  stepNumber: number;
  onComplete?: () => void;
}

export function Timer({ minutes, stepNumber, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context for better browser compatibility
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            setShowCompletionAlert(true);
            playCompletionSound();
            showCompletionNotification();
            onComplete?.();
            
            // Auto-hide alert after 10 seconds
            setTimeout(() => setShowCompletionAlert(false), 10000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const playCompletionSound = () => {
    try {
      // Create a more pleasant completion sound using Web Audio API
      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Create a pleasant chime sound
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      } else {
        // Fallback: try to play a simple beep
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcZCDuZ3ZOWNA');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Silent fail if audio can't play
        });
      }
    } catch (error) {
      console.warn('Could not play completion sound:', error);
    }
  };

  const showCompletionNotification = () => {
    // Browser notification
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const notification = new Notification(`Timer Complete! 🎉`, {
            body: `Step ${stepNumber} is finished. Time to move to the next step!`,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: `timer-${stepNumber}`,
            requireInteraction: true,
            actions: [
              { action: 'dismiss', title: 'Dismiss' }
            ]
          });

          // Auto-close notification after 10 seconds
          setTimeout(() => notification.close(), 10000);
        }
      });
    }

    // Page title notification
    const originalTitle = document.title;
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      document.title = blinkCount % 2 === 0 ? '🔔 Timer Complete!' : originalTitle;
      blinkCount++;
      if (blinkCount >= 10) {
        clearInterval(blinkInterval);
        document.title = originalTitle;
      }
    }, 1000);

    // Vibration on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isCompleted) {
      resetTimer();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setShowCompletionAlert(false);
  };

  const dismissAlert = () => {
    setShowCompletionAlert(false);
  };

  const progress = ((minutes * 60 - timeLeft) / (minutes * 60)) * 100;

  return (
    <div className="relative">
      {/* Completion Alert */}
      {showCompletionAlert && (
        <div className="absolute -top-4 left-0 right-0 z-10 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg border-2 border-green-400 animate-bounce">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Timer Complete!</h4>
                  <p className="text-green-100">Step {stepNumber} is finished. Great job!</p>
                </div>
              </div>
              <button
                onClick={dismissAlert}
                className="text-white hover:text-green-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 ${
        isCompleted ? 'ring-2 ring-green-400 bg-gradient-to-br from-green-50 to-emerald-50' : ''
      }`}>
        <div className="text-center">
          <div className="mb-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 ${
                    isCompleted ? 'text-green-500' : 'text-orange-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500">Step {stepNumber}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                isCompleted
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : isRunning
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isCompleted ? (
                <RotateCcw className="w-5 h-5" />
              ) : isRunning ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={resetTimer}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={playCompletionSound}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              title="Test sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {isCompleted && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-green-600 font-medium">
              <Bell className="w-4 h-4 animate-pulse" />
              <span>Timer Complete!</span>
            </div>
          )}

          {isRunning && timeLeft <= 10 && timeLeft > 0 && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-red-600 font-medium animate-pulse">
              <Bell className="w-4 h-4" />
              <span>Almost done!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}