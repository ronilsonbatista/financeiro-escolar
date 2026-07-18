import React from 'react';

interface CurrencyValueProps {
  value: number;
  colorType?: 'positive' | 'negative' | 'neutral' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showSign?: boolean;
}

export default function CurrencyValue({
  value,
  colorType = 'auto',
  className = '',
  size = 'md',
  showSign = true,
}: CurrencyValueProps) {
  // Format as BRL: e.g. R$ 85.000,00
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);

  // Determine sign prefix
  const isNegative = value < 0;
  const sign = isNegative ? '-' : '';

  // Determine color classes for Batista Sobrinho Identity
  let colorClass = 'text-[#161616]';
  if (colorType === 'auto') {
    if (value > 0) colorClass = 'text-status-success-text font-bold';
    else if (value < 0) colorClass = 'text-status-overdue-text font-bold';
    else colorClass = 'text-slate-500';
  } else if (colorType === 'positive') {
    colorClass = 'text-status-success-text font-bold';
  } else if (colorType === 'negative') {
    colorClass = 'text-status-overdue-text font-bold';
  } else if (colorType === 'neutral') {
    colorClass = 'text-[#161616]';
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-lg font-extrabold',
    xl: 'text-xl font-extrabold tracking-tight',
    '2xl': 'text-2xl font-black tracking-tight',
    '3xl': 'text-3xl font-black tracking-tight',
  };

  return (
    <span className={`${sizeClasses[size]} ${colorClass} ${className} font-sans tabular-nums inline-flex items-center`}>
      {showSign && isNegative && <span className="mr-0.5">{sign}</span>}
      {formatted}
    </span>
  );
}
