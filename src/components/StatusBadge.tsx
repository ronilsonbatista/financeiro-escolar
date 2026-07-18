import React from 'react';
import { TransactionStatus } from '@/types/financial';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const configs = {
    pago: {
      label: 'Pago',
      bgColor: 'bg-status-success-bg',
      borderColor: 'border-status-success-border',
      textColor: 'text-status-success-text',
      dotColor: 'bg-status-success-text',
      icon: CheckCircle2,
    },
    pendente: {
      label: 'Pendente',
      bgColor: 'bg-status-pending-bg',
      borderColor: 'border-status-pending-border',
      textColor: 'text-status-pending-text',
      dotColor: 'bg-status-pending-text',
      icon: Clock,
    },
    atrasado: {
      label: 'Atrasado',
      bgColor: 'bg-status-overdue-bg',
      borderColor: 'border-status-overdue-border',
      textColor: 'text-status-overdue-text',
      dotColor: 'bg-status-overdue-text',
      icon: AlertCircle,
    },
    cancelado: {
      label: 'Cancelado',
      bgColor: 'bg-status-cancelled-bg',
      borderColor: 'border-status-cancelled-border',
      textColor: 'text-status-cancelled-text',
      dotColor: 'bg-status-cancelled-text',
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.pendente;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-extrabold rounded-md border ${config.bgColor} ${config.borderColor} ${config.textColor} ${className} transition-colors font-sans shadow-2xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
