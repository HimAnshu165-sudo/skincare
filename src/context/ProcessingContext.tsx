'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ProcessingState {
  isProcessing: boolean;
  message: string;
  subtitle: string;
}

interface ProcessingContextType {
  isProcessing: boolean;
  message: string;
  subtitle: string;
  showProcessing: (message: string, subtitle?: string) => void;
  hideProcessing: () => void;
  withProcessing: <T>(action: () => Promise<T>, message: string, subtitle?: string) => Promise<T>;
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

export function ProcessingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPathRef = useRef(pathname);

  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    message: 'Processing...',
    subtitle: 'Please wait a moment.',
  });

  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const failsafeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  const hideProcessing = useCallback(() => {
    clearTimers();
    setState((prev) => {
      if (!prev.isProcessing) return prev;
      return {
        ...prev,
        isProcessing: false,
      };
    });
  }, [clearTimers]);

  // Automatically dismiss global processing overlay when navigation / route changes occur
  useEffect(() => {
    if (currentPathRef.current !== pathname) {
      currentPathRef.current = pathname;
      hideProcessing();
    }
  }, [pathname, hideProcessing]);

  const showProcessing = useCallback(
    (message: string, subtitle = 'Please wait a moment.') => {
      clearTimers();

      setState({
        isProcessing: true,
        message,
        subtitle,
      });

      // Update subtitle if the request is taking longer than 10 seconds
      slowTimerRef.current = setTimeout(() => {
        setState((prev) => {
          if (!prev.isProcessing) return prev;
          return {
            ...prev,
            subtitle: 'Still processing your request... Please do not close or refresh this page.',
          };
        });
      }, 10000);

      // Failsafe auto-unlock at 45 seconds to prevent permanent UI lockup
      failsafeTimerRef.current = setTimeout(() => {
        console.warn('Processing overlay failsafe timeout triggered.');
        hideProcessing();
      }, 45000);
    },
    [clearTimers, hideProcessing]
  );

  const withProcessing = useCallback(
    async <T,>(action: () => Promise<T>, message: string, subtitle?: string): Promise<T> => {
      showProcessing(message, subtitle);
      try {
        const result = await action();
        return result;
      } finally {
        hideProcessing();
      }
    },
    [showProcessing, hideProcessing]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return (
    <ProcessingContext.Provider
      value={{
        isProcessing: state.isProcessing,
        message: state.message,
        subtitle: state.subtitle,
        showProcessing,
        hideProcessing,
        withProcessing,
      }}
    >
      {children}
    </ProcessingContext.Provider>
  );
}

export function useProcessing() {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingProvider');
  }
  return context;
}
