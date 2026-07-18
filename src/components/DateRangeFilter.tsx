import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRangeOption = 'current' | 'previous' | '3months' | '6months' | 'year' | 'custom';

interface DateRangeFilterProps {
  selectedRange: DateRangeOption;
  onChangeRange: (range: DateRangeOption) => void;
  customStartDate: string;
  customEndDate: string;
  onChangeCustomDates: (start: string, end: string) => void;
}

export default function DateRangeFilter({
  selectedRange,
  onChangeRange,
  customStartDate,
  customEndDate,
  onChangeCustomDates,
}: DateRangeFilterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Calendar style={{ width: '14px', height: '14px', color: '#1E3280', marginRight: '2px' }} />
        
        {/* Dropdown to select predefined ranges */}
        <select
          value={selectedRange}
          onChange={(e) => onChangeRange(e.target.value as DateRangeOption)}
          style={{
            padding: '5px 28px 5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#374151',
            backgroundColor: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: '6px',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            WebkitAppearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%236B7280\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
            backgroundSize: '18px'
          }}
        >
          <option value="current">Mês atual</option>
          <option value="previous">Mês anterior</option>
          <option value="3months">Últimos 3 meses</option>
          <option value="6months">Últimos 6 meses</option>
          <option value="year">Ano atual (2026)</option>
          <option value="custom">Período personalizado</option>
        </select>
      </div>

      {/* Render input elements when 'custom' is active */}
      {selectedRange === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', animation: 'cebsFadeIn 0.2s ease forwards' }}>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onChangeCustomDates(e.target.value, customEndDate)}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#374151',
              border: '1.5px solid #E5E7EB',
              borderRadius: '6px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>à</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => onChangeCustomDates(customStartDate, e.target.value)}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#374151',
              border: '1.5px solid #E5E7EB',
              borderRadius: '6px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      )}
    </div>
  );
}
