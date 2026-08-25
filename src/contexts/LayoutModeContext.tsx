"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LayoutMode = 'modern' | 'classic';

interface LayoutModeContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleLayoutMode: () => void;
}

const STORAGE_KEY = 'cebs_layout_mode';

const LayoutModeContext = createContext<LayoutModeContextType | undefined>(undefined);

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>('modern');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY) as LayoutMode | null;
      if (savedMode === 'modern' || savedMode === 'classic') {
        setLayoutModeState(savedMode);
      } else {
        const envDefault = process.env.NEXT_PUBLIC_DEFAULT_LAYOUT_MODE as LayoutMode | undefined;
        if (envDefault === 'modern' || envDefault === 'classic') {
          setLayoutModeState(envDefault);
        } else {
          setLayoutModeState('modern');
        }
      }
    } catch (e) {
      console.error('Erro ao ler cebs_layout_mode:', e);
    } finally {
      setIsMounted(true);
    }
  }, []);

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.error('Erro ao salvar cebs_layout_mode:', e);
    }
  };

  const toggleLayoutMode = () => {
    const nextMode = layoutMode === 'modern' ? 'classic' : 'modern';
    setLayoutMode(nextMode);
  };

  return (
    <LayoutModeContext.Provider value={{ layoutMode, setLayoutMode, toggleLayoutMode }}>
      {children}
    </LayoutModeContext.Provider>
  );
}

export function useLayoutMode() {
  const context = useContext(LayoutModeContext);
  if (!context) {
    throw new Error('useLayoutMode deve ser usado dentro de um LayoutModeProvider');
  }
  return context;
}
