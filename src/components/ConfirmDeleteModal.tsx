import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  warningText?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  itemName,
  warningText = 'Esta ação é permanente e não poderá ser desfeita.',
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Card Body */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-lg shadow-xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 text-sans text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2 space-y-4">
          <div className="p-3 rounded-full bg-red-50 border border-red-200/60 text-red-600 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 font-title">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Você tem certeza que deseja excluir <strong className="text-slate-900">"{itemName}"</strong>?
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200/60 text-red-600 text-xs leading-relaxed max-w-sm font-semibold">
            {warningText}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 w-full pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmar Exclusão</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
