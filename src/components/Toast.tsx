import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000); // Autoclose after 4 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const configs = {
    success: {
      borderColor: 'border-[#4A6B53]/20',
      bgColor: 'bg-[#FFFDF7]',
      iconColor: 'text-[#4A6B53]',
      icon: CheckCircle,
      shadow: 'shadow-[0_4px_12px_rgba(22,23,15,0.04)]',
    },
    error: {
      borderColor: 'border-[#A95454]/20',
      bgColor: 'bg-[#FFFDF7]',
      iconColor: 'text-[#A95454]',
      icon: AlertTriangle,
      shadow: 'shadow-[0_4px_12px_rgba(22,23,15,0.04)]',
    },
    info: {
      borderColor: 'border-[#777745]/20',
      bgColor: 'bg-[#FFFDF7]',
      iconColor: 'text-[#777745]',
      icon: Info,
      shadow: 'shadow-[0_4px_12px_rgba(22,23,15,0.04)]',
    },
  };

  const config = configs[toast.type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border ${config.borderColor} ${config.bgColor} ${config.shadow} text-sm transition-all duration-300 animate-in slide-in-from-right-10 fade-in duration-200`}
    >
      <div className={`${config.iconColor} shrink-0 mt-0.5`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 space-y-0.5 text-left font-sans">
        <h5 className="font-bold text-[#16170F]">{toast.title}</h5>
        <p className="text-xs text-[#5C5E54] leading-relaxed">{toast.message}</p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="text-[#5C5E54] hover:text-[#16170F] p-0.5 rounded transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
