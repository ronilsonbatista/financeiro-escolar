import React, { useState, useEffect } from 'react';
import { Expense, Income, Category, Supplier, TransactionStatus } from '@/types/financial';
import {
  X, Calendar, CheckCircle2, AlertCircle, Sparkles, Receipt, Trash2,
  ArrowUpRight, ArrowDownRight, Folder, Edit2, Plus, Info, Check, Eye, Lock
} from 'lucide-react';
import CurrencyValue from './CurrencyValue';

// Icon Map for dynamic lookup inside the project
import * as Icons from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function ModalWrapper({ isOpen, onClose, title, children }: ModalWrapperProps) {
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
        className="absolute inset-0 bg-[#191909]/45 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Content Container */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-xl shadow-xl p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative">
          <h3 className="text-base font-black font-title text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// 1. EXPENSE FORM MODAL (SaaS direct form with inline category creation sub-flow)
interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  categories: Category[];
  suppliers?: Supplier[];
  editingExpense?: Expense | null;
  onAddCategoryInline?: (category: Category) => void;
  onAddSupplierInline?: (supplier: Supplier) => void;
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  suppliers = [],
  editingExpense,
  onAddCategoryInline,
  onAddSupplierInline,
}: ExpenseFormModalProps) {
  const expenseCategories = categories.filter(c => 
    c.type === 'despesa' && (c.active || (editingExpense && c.id === editingExpense.categoryId))
  );

  const activeSuppliers = suppliers.filter(s =>
    s.isActive || (editingExpense && (s.id === editingExpense.supplierId || s.name === editingExpense.supplier))
  );

  // Form States
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [status, setStatus] = useState<TransactionStatus>('pendente');
  const [expenseType, setExpenseType] = useState<'fixa' | 'variavel' | 'recorrente' | 'extraordinaria'>('fixa');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('mensal');
  const [costCenter, setCostCenter] = useState('');
  const [notes, setNotes] = useState('');

  // Inline Category Creator States
  const [creatingInlineCategory, setCreatingInlineCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [newCatIcon, setNewCatIcon] = useState('Folder');

  // Inline Supplier Creator States
  const [creatingInlineSupplier, setCreatingInlineSupplier] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupDoc, setNewSupDoc] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');

  // Inline validation errors (no alerts rule)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [revertConfirm, setRevertConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setRevertConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setCategoryId(editingExpense.categoryId);
      setSupplierId(editingExpense.supplierId || '');
      setSupplier(editingExpense.supplier);
      setAmount(editingExpense.amount.toString());
      setDueDate(editingExpense.dueDate);
      setPaymentDate(editingExpense.paymentDate || '');
      setPaymentMethod(editingExpense.paymentMethod || 'PIX');
      setStatus(editingExpense.status);
      setExpenseType(editingExpense.type || 'fixa');
      setIsRecurring(editingExpense.isRecurring || false);
      setRecurrenceFrequency(editingExpense.recurrenceFrequency || 'mensal');
      setCostCenter(editingExpense.costCenter || '');
      setNotes(editingExpense.notes || '');
      setCreatingInlineCategory(false);
      setCreatingInlineSupplier(false);
    } else {
      setDescription('');
      if (expenseCategories.length > 0) {
        setCategoryId(expenseCategories[0].id);
      }
      setSupplierId('');
      setSupplier('');
      setAmount('');
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setPaymentDate('');
      setPaymentMethod('PIX');
      setStatus('pendente');
      setExpenseType('fixa');
      setIsRecurring(false);
      setRecurrenceFrequency('mensal');
      setCostCenter('');
      setNotes('');
      setCreatingInlineCategory(false);
      setCreatingInlineSupplier(false);
    }
  }, [editingExpense, isOpen]);

  const handleCreateInlineSupplier = () => {
    if (!newSupName.trim()) {
      setErrorMessage('Por favor, insira o nome do fornecedor.');
      return;
    }
    const newId = `sup-${Date.now()}-${Math.random()}`;
    const newSup: Supplier = {
      id: newId,
      name: newSupName.trim(),
      documentNumber: newSupDoc.trim() || undefined,
      phone: newSupPhone.trim() || undefined,
      email: newSupEmail.trim() || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddSupplierInline) {
      onAddSupplierInline(newSup);
    }
    setSupplierId(newId);
    setSupplier(newSup.name);
    setCreatingInlineSupplier(false);
    setNewSupName('');
    setNewSupDoc('');
    setNewSupPhone('');
    setNewSupEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (creatingInlineCategory) {
      setErrorMessage('Por favor, salve ou cancele a criação da nova categoria antes de salvar a despesa.');
      return;
    }
    if (creatingInlineSupplier) {
      setErrorMessage('Por favor, salve ou cancele a criação do novo fornecedor antes de salvar a despesa.');
      return;
    }
    if (!description || !amount || parseFloat(amount) <= 0 || !dueDate || !categoryId || categoryId === 'NEW_CATEGORY') {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    // Required fields rule: for status "pago", paymentDate is mandatory
    if (status === 'pago' && !paymentDate) {
      setErrorMessage('A data de pagamento é obrigatória para despesas marcadas como Pago.');
      return;
    }

    // Paid to pending transition safety confirmation rule (sem alert)
    if (editingExpense && editingExpense.status === 'pago' && status === 'pendente' && !revertConfirm) {
      setRevertConfirm(true);
      setErrorMessage('Aviso: Você está alterando uma despesa Paga de volta para Pendente. Para prosseguir, confirme marcando a caixa no rodapé do formulário e clique em Salvar.');
      return;
    }

    onSubmit({
      id: editingExpense?.id,
      description: description.trim(),
      categoryId,
      supplierId: supplierId || undefined,
      supplier: supplier.trim(),
      amount: parseFloat(amount),
      dueDate,
      paymentDate: status === 'pago' ? paymentDate : undefined,
      paymentMethod: status === 'pago' ? paymentMethod : undefined,
      status,
      type: expenseType,
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
      costCenter: costCenter || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  const handleCreateInlineCategory = () => {
    if (!newCatName.trim()) {
      alert('Por favor, insira o nome da nova categoria.');
      return;
    }
    const newId = `cat-${Date.now()}-${Math.random()}`;
    const newCat: Category = {
      id: newId,
      name: newCatName.trim(),
      type: 'despesa',
      color: newCatColor,
      icon: newCatIcon,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddCategoryInline) {
      onAddCategoryInline(newCat);
    }
    setCategoryId(newId);
    setCreatingInlineCategory(false);
    setNewCatName('');
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-[#16170F] text-left font-sans">
        
        {errorMessage && (
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-650 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
            {errorMessage}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Descrição / Referência *</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Salários Professores, Manutenção de Computadores"
            className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
          />
        </div>

        {/* Category Selector with Inline Creation option */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Categoria *</label>
          <select
            value={creatingInlineCategory ? 'NEW_CATEGORY' : categoryId}
            onChange={(e) => {
              if (e.target.value === 'NEW_CATEGORY') {
                setCreatingInlineCategory(true);
              } else {
                setCategoryId(e.target.value);
                setCreatingInlineCategory(false);
              }
            }}
            className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
          >
            {expenseCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="NEW_CATEGORY">+ Criar nova categoria...</option>
          </select>

          {/* Inline category form */}
          {creatingInlineCategory && (
            <div className="p-4 rounded-lg border border-[#B8A66A]/20 bg-[#FAF7EE] space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#16170F] uppercase tracking-widest">Criar Categoria</span>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingInlineCategory(false);
                    if (expenseCategories.length > 0) setCategoryId(expenseCategories[0].id);
                  }}
                  className="text-[10px] font-bold text-[#A95454] hover:underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full walltravel-input px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Color */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#5C5E54] block uppercase">Cor</span>
                  <select
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-full walltravel-input px-2 py-1 text-xs font-semibold"
                  >
                    {['indigo', 'amber', 'yellow', 'sky', 'blue', 'orange', 'pink', 'red', 'cyan', 'rose', 'teal', 'violet', 'fuchsia', 'zinc'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Icon */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#5C5E54] block uppercase">Ícone</span>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full walltravel-input px-2 py-1 text-xs font-semibold"
                  >
                    {['Users', 'Building2', 'Zap', 'Droplet', 'Wifi', 'BookOpen', 'Wrench', 'Megaphone', 'Receipt', 'Truck', 'Utensils', 'Sparkles', 'Laptop', 'Calendar', 'MoreHorizontal'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateInlineCategory}
                className="w-full py-2 text-xs font-bold rounded-lg bg-[#191909] hover:bg-[#777745] text-white transition-colors cursor-pointer"
              >
                Salvar e Selecionar
              </button>
            </div>
          )}
        </div>

        {/* Supplier & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Fornecedor</label>
            <select
              value={creatingInlineSupplier ? 'NEW_SUPPLIER' : (supplierId || (activeSuppliers.find(s => s.name.toLowerCase() === supplier.toLowerCase())?.id || (supplier ? 'CUSTOM' : '')))}
              onChange={(e) => {
                if (e.target.value === 'NEW_SUPPLIER') {
                  setCreatingInlineSupplier(true);
                } else if (e.target.value === 'CUSTOM') {
                  setSupplierId('');
                  setCreatingInlineSupplier(false);
                } else {
                  const sel = activeSuppliers.find(s => s.id === e.target.value);
                  if (sel) {
                    setSupplierId(sel.id);
                    setSupplier(sel.name);
                  } else {
                    setSupplierId('');
                  }
                  setCreatingInlineSupplier(false);
                }
              }}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            >
              <option value="">Sem fornecedor informado...</option>
              {activeSuppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              <option value="NEW_SUPPLIER">+ Criar novo fornecedor...</option>
            </select>

            {/* Inline Supplier Form */}
            {creatingInlineSupplier && (
              <div className="p-4 rounded-lg border border-[#1E3280]/20 bg-[#F4F6FC] space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1E3280] uppercase tracking-widest">Novo Fornecedor</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingInlineSupplier(false);
                    }}
                    className="text-[10px] font-bold text-[#A95454] hover:underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Nome do fornecedor *"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full walltravel-input px-3 py-1.5 text-xs font-semibold"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="CNPJ/CPF"
                    value={newSupDoc}
                    onChange={(e) => setNewSupDoc(e.target.value)}
                    className="w-full walltravel-input px-3 py-1.5 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    className="w-full walltravel-input px-3 py-1.5 text-xs font-semibold"
                  />
                </div>

                <input
                  type="email"
                  placeholder="E-mail"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  className="w-full walltravel-input px-3 py-1.5 text-xs font-semibold"
                />

                <button
                  type="button"
                  onClick={handleCreateInlineSupplier}
                  className="w-full py-2 text-xs font-bold rounded-lg bg-[#1E3280] text-white transition-colors cursor-pointer"
                >
                  Salvar e Selecionar
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-bold"
            />
          </div>
        </div>

        {/* Expense Type & Recurrence Option */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Classificação da Despesa</label>
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as any)}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            >
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
              <option value="recorrente">Recorrente</option>
              <option value="extraordinaria">Extraordinária</option>
            </select>
          </div>

          <div className="space-y-2 flex flex-col justify-end">
            <label className="flex items-center gap-2.5 text-xs font-bold text-[#16170F] cursor-pointer select-none pb-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-[#191909] bg-[#FFFDF7] border-[rgba(22,23,15,0.12)] focus:ring-[#B8A66A] w-4 h-4"
              />
              <span>Despesa recorrente?</span>
            </label>
          </div>
        </div>

        {/* Recurrence Frequency */}
        {isRecurring && (
          <div className="p-3.5 rounded-lg border border-[rgba(22,23,15,0.08)] bg-[#F6F1E8]/50 animate-in fade-in slide-in-from-top-1 text-left space-y-1.5">
            <span className="text-[10px] font-bold text-[#5C5E54] block uppercase">Frequência da Recorrência</span>
            <select
              value={recurrenceFrequency}
              onChange={(e) => setRecurrenceFrequency(e.target.value)}
              className="w-full walltravel-input px-3 py-2 text-xs text-[#16170F] font-semibold bg-white"
            >
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Data de Vencimento *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Data de Pagamento</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                if (e.target.value) {
                  setStatus('pago');
                }
              }}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            />
          </div>
        </div>

        {/* Method & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            >
              {['PIX', 'Cartão', 'Boleto', 'Dinheiro', 'Transferência', 'Débito automático', 'Outro'].map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Status da Despesa</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                if (e.target.value !== 'pago') setPaymentDate('');
                else if (!paymentDate) {
                  setPaymentDate(new Date().toISOString().split('T')[0]);
                }
              }}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-bold"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Centro de Custo */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Centro de Custo</label>
          <input
            type="text"
            value={costCenter}
            onChange={(e) => setCostCenter(e.target.value)}
            placeholder="Ex: Administração, Pedagógico, Infraestrutura"
            className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
          />
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Conta com vencimento prorrogado"
            rows={2}
            className="w-full walltravel-input px-4 py-2.5 text-xs text-[#16170F] resize-none font-semibold"
          />
        </div>

        {/* Revert confirmation checkbox */}
        {revertConfirm && (
          <div className="p-3.5 rounded-lg border border-yellow-250 bg-yellow-50/50 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <input
              type="checkbox"
              id="confirm-revert-checkbox"
              checked={revertConfirm}
              onChange={(e) => setRevertConfirm(e.target.checked)}
              className="rounded border-[#E4DFD2] text-[#173B72] focus:ring-[#173B72] w-4.5 h-4.5 mt-0.5 cursor-pointer"
            />
            <label htmlFor="confirm-revert-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer leading-tight">
              Confirmo a alteração desta despesa de Paga para Pendente. Entendo que os dados de pagamento (data e forma) serão limpos.
            </label>
          </div>
        )}

        {/* Form controls */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-3 text-xs font-bold rounded-lg btn-wt-primary shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Salvar Despesa
          </button>
        </div>

      </form>
    </ModalWrapper>
  );
}

// 2. INCOME FORM MODAL (SaaS direct form with inline category creation sub-flow)
interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  categories: Category[];
  editingIncome?: Income | null;
  onAddCategoryInline?: (category: Category) => void;
}

export function IncomeFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingIncome,
  onAddCategoryInline,
}: IncomeFormModalProps) {
  const incomeCategories = categories.filter(c => 
    c.type === 'receita' && (c.active || (editingIncome && c.id === editingIncome.categoryId))
  );

  // Form States
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [notes, setNotes] = useState('');

  // Inline Category Creator States
  const [creatingInlineCategory, setCreatingInlineCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [newCatIcon, setNewCatIcon] = useState('Folder');

  // Inline validation errors (no alerts rule)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (incomeCategories.length > 0 && !categoryId) {
      setCategoryId(incomeCategories[0].id);
    }
  }, [incomeCategories, categoryId]);

  useEffect(() => {
    if (editingIncome) {
      setDescription(editingIncome.description);
      setCategoryId(editingIncome.categoryId);
      setSource(editingIncome.source);
      setAmount(editingIncome.amount.toString());
      setReceivedDate(editingIncome.receivedDate);
      setPaymentMethod(editingIncome.paymentMethod || 'PIX');
      setNotes(editingIncome.notes || '');
      setCreatingInlineCategory(false);
    } else {
      setDescription('');
      if (incomeCategories.length > 0) {
        setCategoryId(incomeCategories[0].id);
      }
      setSource('Responsável Financeiro');
      setAmount('');
      const today = new Date().toISOString().split('T')[0];
      setReceivedDate(today);
      setPaymentMethod('PIX');
      setNotes('');
      setCreatingInlineCategory(false);
    }
  }, [editingIncome, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (creatingInlineCategory) {
      setErrorMessage('Por favor, salve ou cancele a criação da nova categoria antes de salvar a receita.');
      return;
    }
    if (!description || !amount || parseFloat(amount) <= 0 || !receivedDate || !categoryId || categoryId === 'NEW_CATEGORY') {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    onSubmit({
      id: editingIncome?.id,
      categoryId,
      description,
      source,
      amount: parseFloat(amount),
      receivedDate,
      paymentMethod,
      notes: notes || undefined,
    });
    onClose();
  };

  const handleCreateInlineCategory = () => {
    if (!newCatName.trim()) {
      alert('Por favor, insira o nome da nova categoria.');
      return;
    }
    const newId = `cat-${Date.now()}-${Math.random()}`;
    const newCat: Category = {
      id: newId,
      name: newCatName.trim(),
      type: 'receita',
      color: newCatColor,
      icon: newCatIcon,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddCategoryInline) {
      onAddCategoryInline(newCat);
    }
    setCategoryId(newId);
    setCreatingInlineCategory(false);
    setNewCatName('');
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={editingIncome ? 'Editar Receita' : 'Nova Receita'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-[#16170F] text-left font-sans">
        
        {errorMessage && (
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-650 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
            {errorMessage}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Descrição da Receita *</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Mensalidade - João Silva, Taxa de Matrícula"
            className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
          />
        </div>

        {/* Origin / Source */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Origem da Receita (Pagador) *</label>
          <input
            type="text"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex: Responsável Financeiro, Cantina Escolar"
            className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
          />
        </div>

        {/* Category & Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Categoria *</label>
            <select
              value={creatingInlineCategory ? 'NEW_CATEGORY' : categoryId}
              onChange={(e) => {
                if (e.target.value === 'NEW_CATEGORY') {
                  setCreatingInlineCategory(true);
                } else {
                  setCategoryId(e.target.value);
                  setCreatingInlineCategory(false);
                }
              }}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            >
              {incomeCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="NEW_CATEGORY">+ Criar nova categoria...</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-bold"
            />
          </div>
        </div>

        {/* Inline Category Creation Section */}
        {creatingInlineCategory && (
          <div className="p-4 rounded-lg border border-[#B8A66A]/20 bg-[#FAF7EE] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#16170F] uppercase tracking-widest">Criar Categoria Receita</span>
              <button
                type="button"
                onClick={() => {
                  setCreatingInlineCategory(false);
                  if (incomeCategories.length > 0) setCategoryId(incomeCategories[0].id);
                }}
                className="text-[10px] font-bold text-[#A95454] hover:underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Nome da categoria"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full walltravel-input px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Color */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#5C5E54] block uppercase">Cor</span>
                <select
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-full walltravel-input px-2 py-1 text-xs font-semibold"
                >
                  {['indigo', 'amber', 'yellow', 'sky', 'blue', 'orange', 'pink', 'red', 'cyan', 'rose', 'teal', 'violet', 'fuchsia', 'zinc'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Icon */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#5C5E54] block uppercase">Ícone</span>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full walltravel-input px-2 py-1 text-xs font-semibold"
                >
                  {['Users', 'Building2', 'Zap', 'Droplet', 'Wifi', 'BookOpen', 'Wrench', 'Megaphone', 'Receipt', 'Truck', 'Utensils', 'Sparkles', 'Laptop', 'Calendar', 'MoreHorizontal'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateInlineCategory}
              className="w-full py-2 text-xs font-bold rounded-lg bg-[#191909] hover:bg-[#777745] text-white transition-colors cursor-pointer"
            >
              Salvar e Selecionar
            </button>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Data de Recebimento *</label>
            <input
              type="date"
              required
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Forma de Recebimento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
            >
              {['PIX', 'Cartão', 'Boleto', 'Dinheiro', 'Transferência', 'Outro'].map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Pagamento efetuado via boleto"
            rows={2}
            className="w-full walltravel-input px-4 py-2.5 text-xs text-[#16170F] resize-none font-semibold"
          />
        </div>

        {/* Form controls */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-3 text-xs font-bold rounded-lg btn-wt-primary shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Salvar Receita
          </button>
        </div>

      </form>
    </ModalWrapper>
  );
}

// 3. CATEGORY MANAGER MODAL (Gerenciar Categorias)
interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCategory: (id: string, category: Partial<Category>) => void;
  onDeleteCategory: (id: string) => boolean | Promise<boolean>;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  expenses,
  incomes,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  
  // Icon and Color choices
  const availableIcons = ['Users', 'Building2', 'Zap', 'Droplet', 'Wifi', 'BookOpen', 'Wrench', 'Megaphone', 'Receipt', 'Truck', 'Utensils', 'Sparkles', 'Laptop', 'Calendar', 'MoreHorizontal'];
  const availableColors = ['indigo', 'amber', 'yellow', 'sky', 'blue', 'orange', 'pink', 'red', 'cyan', 'rose', 'teal', 'violet', 'fuchsia', 'zinc'];

  // Panel State: 'list' | 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isActive, setIsActive] = useState(true);

  // Validation block state
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView('list');
      setEditingId(null);
      setBlockMessage(null);
    }
  }, [isOpen]);

  const handleOpenForm = (cat?: Category) => {
    setBlockMessage(null);
    if (cat) {
      // Edit mode
      setEditingId(cat.id);
      setName(cat.name);
      setIsExpense(cat.type === 'despesa');
      setSelectedIcon(cat.icon);
      setSelectedColor(cat.color);
      setIsActive(cat.active);
    } else {
      // Create mode
      setEditingId(null);
      setName('');
      setIsExpense(true);
      setSelectedIcon('Folder');
      setSelectedColor('indigo');
      setIsActive(true);
    }
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Prevent duplicate category names (case-insensitive, excluding current editing category)
    const nameExists = categories.some(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingId
    );
    if (nameExists) {
      setBlockMessage(`Já existe uma categoria cadastrada com o nome "${name.trim()}".`);
      return;
    }

    if (editingId) {
      // Update Category
      onUpdateCategory(editingId, {
        name: name.trim(),
        type: isExpense ? 'despesa' : 'receita',
        icon: selectedIcon,
        color: selectedColor,
        active: isActive,
      });
    } else {
      // Create Category
      onAddCategory({
        name: name.trim(),
        type: isExpense ? 'despesa' : 'receita',
        icon: selectedIcon,
        color: selectedColor,
        active: true,
      });
    }
    setView('list');
  };

  const handleDelete = (cat: Category) => {
    setBlockMessage(null);
    
    // Check if category is bound to any expense or income (even cancelled or archived)
    const isLinked = expenses.some(e => e.categoryId === cat.id) || 
                     incomes.some(i => i.categoryId === cat.id);
    
    if (isLinked) {
      setBlockMessage(`Não é possível excluir a categoria "${cat.name}" porque ela já foi usada em lançamentos. Você pode desativá-la alterando o Status para "Inativo" na edição.`);
      return;
    }

    const success = onDeleteCategory(cat.id);
    if (success) {
      setBlockMessage(null);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Gerenciar Categorias">
      <div className="space-y-5 text-[#16170F] text-left font-sans">
        
        {blockMessage && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl border border-[#A95454]/20 bg-[#FAF2F2] text-[#A95454] text-xs animate-in shake duration-200 font-semibold leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{blockMessage}</p>
          </div>
        )}

        {view === 'list' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs text-[#5C5E54] font-bold">Lista de categorias escolares</span>
              <button
                type="button"
                onClick={() => handleOpenForm()}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg btn-wt-primary transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Categoria</span>
              </button>
            </div>

            {/* List (Spacious rows) */}
            <div className="divide-y divide-[rgba(22,23,15,0.06)] max-h-[50vh] overflow-y-auto space-y-1 pr-1">
              {categories.map(cat => {
                const LucideIcon = (Icons as any)[cat.icon] || Icons.Folder;
                
                // Count transaction usages
                const usageCount = expenses.filter(e => e.categoryId === cat.id && e.status !== 'cancelado').length +
                                   incomes.filter(i => i.categoryId === cat.id).length;

                return (
                  <div key={cat.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-3xs"
                        style={{
                          color: `var(--color-${cat.color}-primary, #173B72)`,
                          backgroundColor: `var(--color-${cat.color}-dark, #EAF2FF)`
                        }}
                      >
                        <LucideIcon className="w-4.5 h-4.5 font-bold" />
                      </div>
                      <div>
                        <span className="font-extrabold text-[#16170F] leading-tight block">{cat.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md ${
                            cat.type === 'despesa' 
                              ? 'bg-status-overdue-bg text-status-overdue-text border border-status-overdue-border' 
                              : 'bg-status-success-bg text-status-success-text border border-status-success-border'
                          }`}>
                            {cat.type === 'despesa' ? 'Despesa' : 'Receita'}
                          </span>
                          {!cat.active && (
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md bg-[#F1F2F0] border border-[rgba(22,23,15,0.08)] text-[#787A72]">
                              Inativo
                            </span>
                          )}
                          <span className="text-[9px] text-[#5C5E54] font-bold">
                            {usageCount} {usageCount === 1 ? 'lançamento' : 'lançamentos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenForm(cat)}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-2 rounded-lg border border-[#A95454]/15 bg-white text-[#A95454] hover:bg-[#FAF2F2] transition-all cursor-pointer shadow-xs"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Form View (Create/Edit) */
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-xs font-black text-[#5C5E54] uppercase tracking-wider font-title">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h4>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Nome da Categoria *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Manutenção Predial, Uniformes Escolares"
                className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Tipo de Fluxo</label>
                <select
                  value={isExpense ? 'despesa' : 'receita'}
                  onChange={(e) => setIsExpense(e.target.value === 'despesa')}
                  className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Status da Categoria</label>
                <select
                  value={isActive ? 'ativo' : 'inativo'}
                  onChange={(e) => setIsActive(e.target.value === 'ativo')}
                  className="w-full walltravel-input px-4 py-2.5 text-sm text-[#16170F] font-semibold"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Cor Identificadora</label>
              <div className="grid grid-cols-5 gap-2.5">
                {availableColors.map(c => {
                  const isColorActive = selectedColor === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-7.5 rounded-lg border text-center transition-all cursor-pointer relative ${
                        isColorActive 
                          ? 'border-[#16170F] scale-[1.05]' 
                          : 'border-slate-200 hover:border-slate-350'
                      }`}
                      style={{
                        backgroundColor: `var(--color-${c}-primary, #777745)`,
                      }}
                      title={c}
                    >
                      {isColorActive && (
                        <Check className="w-3.5 h-3.5 absolute inset-0 m-auto text-white font-bold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C5E54] uppercase tracking-wide">Ícone Representativo</label>
              <div className="grid grid-cols-7 gap-2">
                {availableIcons.map(icName => {
                  const LucideIcon = (Icons as any)[icName] || Icons.Folder;
                  const isIconActive = selectedIcon === icName;
                  return (
                    <button
                      type="button"
                      key={icName}
                      onClick={() => setSelectedIcon(icName)}
                      className={`p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        isIconActive
                          ? 'bg-[#E8DDC8] border-[#B8A66A] text-[#16170F] font-bold shadow-2xs'
                          : 'bg-[#FFFDF7] border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}
                      title={icName}
                    >
                      <LucideIcon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-5 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Voltar à Lista
              </button>
              <button
                type="submit"
                className="px-5 py-3 text-xs font-bold rounded-lg btn-wt-primary shadow-sm hover:scale-[1.02] cursor-pointer"
              >
                Salvar Categoria
              </button>
            </div>

          </form>
        )}

      </div>
    </ModalWrapper>
  );
}

// 4. CLOSED MONTH WARNING MODAL
interface ClosedMonthAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onReopen: () => void;
}

export function ClosedMonthAlert({
  isOpen,
  onClose,
  onReopen,
}: ClosedMonthAlertProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Competência Financeira Fechada">
      <div className="space-y-4 text-slate-700 text-center py-4 flex flex-col items-center font-sans">
        
        <div className="p-3 rounded-full bg-[#FAF2F2] border border-[rgba(169,84,84,0.15)] text-[#A95454] mb-2 animate-bounce">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h4 className="text-base font-bold text-slate-900 font-title">Este lançamento está bloqueado</h4>
        
        <p className="text-xs text-slate-550 max-w-sm leading-relaxed mt-1 font-semibold">
          Não é possível modificar lançamentos quitados em competências fechadas. Para realizar alterações neste período, você precisa reabrir a competência financeira.
        </p>

        <div className="flex items-center gap-2.5 pt-6 w-full border-t border-slate-100 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Entendido
          </button>
          <button
            onClick={() => {
              onReopen();
              onClose();
            }}
            className="flex-1 py-3 text-xs font-bold rounded-lg btn-wt-primary transition-colors cursor-pointer"
          >
            Reabrir Competência
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// 5. TRANSACTION DETAILS MODAL
interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Expense | Income | null;
  categories: Category[];
  onPay: (id: string) => void;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function DetailsModal({
  isOpen,
  onClose,
  transaction,
  categories,
  onPay,
  onDelete,
  onCancel,
}: DetailsModalProps) {
  if (!transaction) return null;

  // Type Guard
  const isExpense = 'supplier' in transaction;
  const displayValue = isExpense ? -transaction.amount : transaction.amount;
  
  const statusLabels = {
    pago: 'Pago',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
    cancelado: 'Cancelado',
  };

  const statusColors = {
    pago: 'text-status-success-text bg-status-success-bg border-status-success-border',
    pendente: 'text-status-pending-text bg-status-pending-bg border-status-pending-border',
    atrasado: 'text-status-overdue-text bg-status-overdue-bg border-status-overdue-border',
    cancelado: 'text-status-cancelled-text bg-status-cancelled-bg border-status-cancelled-border',
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não registrado';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Category Info Lookup
  const cat = categories.find(c => c.id === transaction.categoryId);
  const catName = cat ? cat.name : 'Outros';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Detalhes do Lançamento">
      <div className="space-y-5 text-[#16170F] text-left font-sans">
        
        {/* Type Icon Header */}
        <div className="flex items-center justify-between p-4.5 rounded-lg border border-[rgba(22,23,15,0.08)] bg-[#F6F1E8]/50">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-lg ${isExpense ? 'bg-[#FAF2F2] text-[#A95454]' : 'bg-[#EEF5F1] text-[#4A6B53]'}`}>
              {isExpense ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] text-[#5C5E54] uppercase tracking-wider font-black block leading-none">
                {isExpense ? 'Despesa Escolar' : 'Receita Escolar'}
              </span>
              <h4 className="text-sm font-black text-[#16170F] leading-tight mt-1">{transaction.description}</h4>
            </div>
          </div>
          
          <span className={`px-3 py-1 text-xs font-black rounded-lg border ${
            isExpense 
              ? statusColors[(transaction as Expense).status] 
              : 'text-status-success-text bg-status-success-bg border-status-success-border'
          }`}>
            {isExpense ? statusLabels[(transaction as Expense).status] : 'Recebido'}
          </span>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-2 gap-4.5 text-xs pt-1">
          <div className="space-y-1">
            <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">Categoria</span>
            <span className="font-extrabold text-[#16170F] text-sm">{catName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">
              {isExpense ? 'Fornecedor' : 'Origem (Pagador)'}
            </span>
            <span className="font-extrabold text-[#16170F] text-sm">
              {isExpense ? (transaction as Expense).supplier : (transaction as Income).source}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">
              {isExpense ? 'Vencimento' : 'Data de Entrada'}
            </span>
            <span className="font-extrabold text-[#16170F] text-sm">
              {isExpense ? formatDate((transaction as Expense).dueDate) : formatDate((transaction as Income).receivedDate)}
            </span>
          </div>

          {isExpense && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">Data de Liquidação</span>
              <span className="font-extrabold text-[#16170F] text-sm">{formatDate((transaction as Expense).paymentDate)}</span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">Meio de Transação</span>
            <span className="font-extrabold text-[#16170F] text-sm">{transaction.paymentMethod || 'Não registrado'}</span>
          </div>

          {isExpense && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">Classificação</span>
              <span className="font-extrabold text-[#16170F] text-sm capitalize">
                {(transaction as Expense).type || 'fixa'} 
                {(transaction as Expense).isRecurring ? ` (${(transaction as Expense).recurrenceFrequency})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="space-y-1 pt-1.5">
            <span className="text-[10px] text-[#5C5E54] font-bold block uppercase tracking-wider">Observações</span>
            <p className="text-xs text-slate-700 p-3 rounded-lg bg-[#F6F1E8]/30 border border-[rgba(22,23,15,0.08)] italic leading-relaxed font-semibold">
              {transaction.notes}
            </p>
          </div>
        )}

        <div className="p-4.5 rounded-lg border border-[rgba(22,23,15,0.08)] bg-[#F6F1E8]/40 flex items-center justify-between shadow-2xs">
          <span className="text-xs font-bold text-[#5C5E54] uppercase tracking-wider">Valor Consolidado</span>
          <CurrencyValue value={displayValue} colorType={isExpense ? 'negative' : 'positive'} size="xl" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 pt-4 border-t border-[rgba(22,23,15,0.08)]">
          <button
            onClick={() => {
              onDelete(transaction.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-lg border border-[#A95454]/15 bg-white text-[#A95454] hover:bg-[#FAF2F2] transition-all cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Lançamento</span>
          </button>
          
          <div className="flex-1 flex justify-end gap-2.5">
            {isExpense && ((transaction as Expense).status === 'pendente' || (transaction as Expense).status === 'atrasado') && (
              <>
                {onCancel && (
                  <button
                    onClick={() => {
                      onCancel(transaction.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Cancelar Despesa</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onPay(transaction.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-5 py-3 text-xs font-bold rounded-lg btn-wt-primary transition-all cursor-pointer shadow-sm"
                >
                  <span>Dar Baixa (Pagar)</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </ModalWrapper>
  );
}

// 6. CLOSE MONTH SUMMARY MODAL
interface CloseMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  incomes: Income[];
  onConfirm: () => void;
}

export function CloseMonthModal({
  isOpen,
  onClose,
  expenses,
  incomes,
  onConfirm,
}: CloseMonthModalProps) {
  // Consolidate values
  const activeIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  
  const activeExpenses = expenses.filter(e => e.status !== 'cancelado');
  const paidExpenses = activeExpenses.filter(e => e.status === 'pago').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = activeExpenses.filter(e => e.status === 'pendente').reduce((sum, e) => sum + e.amount, 0);
  const overdueExpenses = activeExpenses.filter(e => e.status === 'atrasado').reduce((sum, e) => sum + e.amount, 0);

  const netOutcome = activeIncomes - paidExpenses;
  const totalExpenses = paidExpenses + pendingExpenses + overdueExpenses;
  const projectedOutcome = activeIncomes - totalExpenses;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Fechar Competência Financeira">
      <div className="space-y-5 text-[#16170F] text-left font-sans">
        <div className="flex items-start gap-3.5 p-4 rounded-xl border border-status-pending-border bg-[#FAF7EE] text-[#B8A66A]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-semibold">
            <strong>Atenção:</strong> Fechar o mês trancará as edições de despesas e receitas quitadas. Certifique-se de que todos os dados correspondem com os saldos extratores reais.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#5C5E54] uppercase tracking-wider font-title">Consolidado Financeiro (Julho/2026)</h4>
          
          <div className="divide-y divide-[rgba(22,23,15,0.05)] rounded-xl border border-[rgba(22,23,15,0.08)] bg-[#F6F1E8]/50 p-4 space-y-3.5 text-[#16170F] font-semibold">
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="text-[#5C5E54] font-bold uppercase text-[9px] tracking-wider">Receita Bruta (Entradas):</span>
              <CurrencyValue value={activeIncomes} colorType="positive" size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs py-1 pt-2">
              <span className="text-[#5C5E54] font-bold uppercase text-[9px] tracking-wider">Despesas Quitadas:</span>
              <CurrencyValue value={-paidExpenses} colorType="negative" size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs py-1 pt-2">
              <span className="text-[#5C5E54] font-bold uppercase text-[9px] tracking-wider">Contas a Pagar (A vencer):</span>
              <CurrencyValue value={-pendingExpenses} colorType="neutral" size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs py-1 pt-2">
              <span className="text-[#5C5E54] font-bold uppercase text-[9px] tracking-wider">Contas em Atraso (Vencidas):</span>
              <CurrencyValue value={-overdueExpenses} colorType="negative" size="sm" />
            </div>

            <div className="flex items-center justify-between font-bold text-xs py-1.5 pt-3.5 border-t border-[rgba(22,23,15,0.08)]">
              <span className="text-[#16170F] font-black uppercase text-[10px] tracking-wider">Resultado Líquido (Realizado):</span>
              <CurrencyValue value={netOutcome} colorType="auto" size="md" />
            </div>

            <div className="flex items-center justify-between font-bold text-xs py-1.5 pt-2">
              <span className="text-[#16170F] font-black uppercase text-[10px] tracking-wider">Resultado Projetado (Ciclo):</span>
              <CurrencyValue value={projectedOutcome} colorType="auto" size="md" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-lg btn-wt-primary transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Confirmar Fechamento</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// 7. SUPPLIER MANAGER MODAL
interface SupplierManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  expenses: Expense[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => boolean | Promise<boolean>;
}

export function SupplierManagerModal({
  isOpen,
  onClose,
  suppliers,
  expenses,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}: SupplierManagerModalProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView('list');
      setEditingId(null);
      setBlockMessage(null);
      setSearch('');
    }
  }, [isOpen]);

  const handleOpenForm = (sup?: Supplier) => {
    setBlockMessage(null);
    if (sup) {
      setEditingId(sup.id);
      setName(sup.name);
      setDocumentNumber(sup.documentNumber || '');
      setPhone(sup.phone || '');
      setEmail(sup.email || '');
      setNotes(sup.notes || '');
      setIsActive(sup.isActive);
    } else {
      setEditingId(null);
      setName('');
      setDocumentNumber('');
      setPhone('');
      setEmail('');
      setNotes('');
      setIsActive(true);
    }
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const exists = suppliers.some(
      s => s.name.toLowerCase() === name.trim().toLowerCase() && s.id !== editingId
    );
    if (exists) {
      setBlockMessage(`Já existe um fornecedor cadastrado com o nome "${name.trim()}".`);
      return;
    }

    if (editingId) {
      onUpdateSupplier(editingId, {
        name: name.trim(),
        documentNumber: documentNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive,
      });
    } else {
      onAddSupplier({
        name: name.trim(),
        documentNumber: documentNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true,
      });
    }
    setView('list');
  };

  const handleDelete = async (sup: Supplier) => {
    setBlockMessage(null);
    const isLinked = expenses.some(e => e.supplierId === sup.id || e.supplier.toLowerCase() === sup.name.toLowerCase());
    if (isLinked) {
      setBlockMessage(`O fornecedor "${sup.name}" possui despesas vinculadas. Ele foi alterado para inativo em vez de excluído.`);
    }

    await onDeleteSupplier(sup.id);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.documentNumber && s.documentNumber.includes(search))
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Gerenciar Fornecedores">
      <div className="space-y-5 text-[#16170F] text-left font-sans">
        {blockMessage && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl border border-[#A95454]/20 bg-[#FAF2F2] text-[#A95454] text-xs font-semibold leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{blockMessage}</p>
          </div>
        )}

        {view === 'list' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <input
                type="text"
                placeholder="Pesquisar fornecedor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="walltravel-input px-3 py-2 text-xs font-semibold flex-1"
              />
              <button
                type="button"
                onClick={() => handleOpenForm()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg btn-wt-primary shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Fornecedor</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto space-y-1 pr-1">
              {filteredSuppliers.map(sup => {
                const usageCount = expenses.filter(e => e.supplierId === sup.id || e.supplier.toLowerCase() === sup.name.toLowerCase()).length;
                return (
                  <div key={sup.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{sup.name}</span>
                        {!sup.isActive && (
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Inativo</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 space-x-2 mt-0.5">
                        {sup.documentNumber && <span>CNPJ/CPF: {sup.documentNumber}</span>}
                        {sup.phone && <span>&bull; {sup.phone}</span>}
                        <span>&bull; {usageCount} {usageCount === 1 ? 'despesa' : 'despesas'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenForm(sup)}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sup)}
                        className="p-2 rounded-lg border border-red-200 bg-white text-red-650 hover:bg-red-50 transition-all cursor-pointer"
                        title="Excluir/Desativar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredSuppliers.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum fornecedor encontrado.</p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
              {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Nome do Fornecedor *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Coelba, Papelaria & Cia"
                className="w-full walltravel-input px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">CNPJ / CPF</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={e => setDocumentNumber(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full walltravel-input px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Telefone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(73) 99999-0000"
                  className="w-full walltravel-input px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contato@fornecedor.com.br"
                className="w-full walltravel-input px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Observações</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Informações adicionais..."
                rows={2}
                className="w-full walltravel-input px-3 py-2 text-xs font-semibold"
              />
            </div>

            {editingId && (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="accent-[#1E3280]"
                />
                Fornecedor Ativo
              </label>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex-1 py-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold rounded-lg btn-wt-primary cursor-pointer"
              >
                Salvar Fornecedor
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
