"use client";

import React from 'react';
import { useLayoutMode } from '@/contexts/LayoutModeContext';
import { Sparkles, Layers } from 'lucide-react';

export default function LayoutModeToggle() {
  const { layoutMode, setLayoutMode } = useLayoutMode();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: '8px',
        padding: '3px',
        border: '1px solid #E2E8F0',
        gap: '2px'
      }}
      title="Alternar entre Layout Novo (Moderno) e Layout Clássico"
    >
      <button
        onClick={() => setLayoutMode('modern')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: layoutMode === 'modern' ? '#1E3280' : 'transparent',
          color: layoutMode === 'modern' ? '#FFFFFF' : '#64748B',
          fontSize: '11px',
          fontWeight: layoutMode === 'modern' ? 700 : 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: layoutMode === 'modern' ? '0 1px 3px rgba(30,50,128,0.25)' : 'none'
        }}
      >
        <Sparkles size={12} color={layoutMode === 'modern' ? '#F59E0B' : '#64748B'} />
        <span>Layout Novo</span>
      </button>

      <button
        onClick={() => setLayoutMode('classic')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: layoutMode === 'classic' ? '#FFFFFF' : 'transparent',
          color: layoutMode === 'classic' ? '#0F172A' : '#64748B',
          fontSize: '11px',
          fontWeight: layoutMode === 'classic' ? 700 : 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: layoutMode === 'classic' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
        }}
      >
        <Layers size={12} color={layoutMode === 'classic' ? '#1E3280' : '#64748B'} />
        <span>Clássico</span>
      </button>
    </div>
  );
}
