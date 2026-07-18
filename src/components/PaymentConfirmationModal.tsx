import React, { useState, useEffect } from 'react';
import { Expense } from '@/types/financial';
import { CheckCircle2, Calendar, DollarSign, X } from 'lucide-react';
import CurrencyValue from './CurrencyValue';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, paymentDate: string, paymentMethod: string, notes?: string) => void;
  transaction: Expense | null;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}: PaymentConfirmationModalProps) {
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [notes, setNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const today = new Date().toISOString().split('T')[0];
      setPaymentDate(today);
      setPaymentMethod('PIX');
      setNotes('');
      setErrorMessage(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!paymentDate || !paymentMethod) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }
    onConfirm(transaction.id, paymentDate, paymentMethod, notes || undefined);
    onClose();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Content Body */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-lg shadow-xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 text-slate-900 font-sans">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-status-success-bg text-status-success-text border border-status-success-border">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base font-black text-slate-900 font-title">Confirmar Liquidação (Baixa)</h3>
        </div>

        {/* Info panel */}
        <div className="mt-4 p-4 rounded-lg border border-slate-200/60 bg-slate-50/50 space-y-2.5">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Descrição</span>
              <p className="text-sm font-bold text-slate-900 leading-tight">{transaction.description}</p>
            </div>
            <CurrencyValue value={-transaction.amount} colorType="negative" size="md" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-500">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Fornecedor</span>
              <span className="font-bold text-slate-900">{transaction.supplier}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Vencimento</span>
              <span className="font-bold text-slate-900">{formatDate(transaction.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-650 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-left">
            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-550 uppercase">Data de Pagamento *</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full walltravel-input px-3 py-2 text-sm text-slate-800"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-550 uppercase">Forma de Pagamento *</label>
              <select
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full walltravel-input px-3 py-2 text-sm text-slate-800"
              >
                {['PIX', 'Cartão', 'Boleto', 'Dinheiro', 'Transferência', 'Débito automático', 'Outro'].map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-550 uppercase">Observações (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pago com desconto de pontualidade, boleto em anexo"
              rows={2}
              className="w-full walltravel-input px-3 py-2 text-xs text-slate-800 resize-none font-medium"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-lg btn-wt-primary shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Liquidar Contas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
