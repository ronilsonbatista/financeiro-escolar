"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Expense, Income, Category, TransactionStatus } from '@/types/financial';
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle, Scale, PieChart,
  PlusCircle, FilterX, HelpCircle, ArrowRightLeft, FolderOpen,
  DollarSign, FileSpreadsheet, ListFilter, CheckSquare, Sparkles,
  Lock, Unlock, ChevronRight, Tags, AlertCircle, Trash2, CheckCircle2,
  LayoutDashboard, Receipt, Settings, Users, CreditCard, BarChart3
} from 'lucide-react';
import DateRangeFilter from '@/components/DateRangeFilter';
import CategoryCardsGrid from '@/components/CategoryCardsGrid';
import ExpensesTable from '@/components/ExpensesTable';
import CurrencyValue from '@/components/CurrencyValue';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import PaymentConfirmationModal from '@/components/PaymentConfirmationModal';
import {
  ExpenseFormModal,
  IncomeFormModal,
  CategoryManagerModal,
  DetailsModal,
  ClosedMonthAlert,
  CloseMonthModal
} from '@/components/Modals';

// Redesigned: Seed categories limited to exactly 10 default expense categories and 3 default revenue categories
const seedCategories: Category[] = [
  // Expense Categories (Exactly 10 options as requested)
  { id: 'cat-2', name: 'Aluguel', type: 'despesa', color: 'amber', icon: 'Building2', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-3', name: 'Energia', type: 'despesa', color: 'yellow', icon: 'Zap', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-4', name: 'Água', type: 'despesa', color: 'sky', icon: 'Droplet', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-5', name: 'Internet', type: 'despesa', color: 'blue', icon: 'Wifi', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-1', name: 'Salários', type: 'despesa', color: 'indigo', icon: 'Users', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-6', name: 'Material escolar', type: 'despesa', color: 'emerald', icon: 'BookOpen', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-12', name: 'Limpeza', type: 'despesa', color: 'teal', icon: 'Sparkles', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-7', name: 'Manutenção', type: 'despesa', color: 'orange', icon: 'Wrench', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-9', name: 'Impostos', type: 'despesa', color: 'red', icon: 'Receipt', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-15', name: 'Outros', type: 'despesa', color: 'zinc', icon: 'MoreHorizontal', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  
  // Revenue Categories (Exactly 3 options)
  { id: 'cat-rev-1', name: 'Mensalidades', type: 'receita', color: 'emerald', icon: 'Users', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-rev-2', name: 'Matrículas', type: 'receita', color: 'indigo', icon: 'Sparkles', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'cat-rev-6', name: 'Outros', type: 'receita', color: 'zinc', icon: 'MoreHorizontal', active: true, createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
];

// Cleaned: Seeding exactly 1 expense record
const seedExpenses: Expense[] = [
  {
    id: 'exp-3',
    description: 'Energia elétrica',
    categoryId: 'cat-3', // Energia
    supplier: 'Concessionária de Energia',
    amount: 350.00,
    dueDate: '2026-07-20',
    status: 'pendente',
    type: 'variavel',
    isRecurring: false,
    costCenter: 'Administração',
    notes: 'Despesa inicial de demonstração',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  }
];

// Cleaned: Seeding 0 initial incomes (empty list) as requested
const seedIncomes: Income[] = [];

export default function FinancialDashboard() {
  const currentDate = '2026-07-04';

  // SSR / Mounting states to resolve hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isMonthClosed, setIsMonthClosed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'payables'>('all');
  const [ledgerMode, setLedgerMode] = useState<'despesa' | 'receita'>('despesa');
  const [showRevenueSummary, setShowRevenueSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'categories' | 'reports'>('overview');

  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modal controls
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<any | null>(null);
  
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCloseMonthModalOpen, setIsCloseMonthModalOpen] = useState(false);
  
  const [closedMonthAlertTriggered, setClosedMonthAlertTriggered] = useState(false);

  // Custom visual confirm overlays
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    warningText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    onConfirm: () => {},
  });

  const [paymentConfirmState, setPaymentConfirmState] = useState<{
    isOpen: boolean;
    expense: Expense | null;
  }>({
    isOpen: false,
    expense: null,
  });

  // Safe localStorage Hydration on mount using v3 keys to perform clean transition
  useEffect(() => {
    // 1. Categories
    const localCategories = localStorage.getItem('school_categories_v3');
    if (localCategories) {
      setCategories(JSON.parse(localCategories));
    } else {
      setCategories(seedCategories);
      localStorage.setItem('school_categories_v3', JSON.stringify(seedCategories));
    }

    // 2. Expenses
    const localExpenses = localStorage.getItem('school_expenses_v3');
    if (localExpenses) {
      setExpenses(JSON.parse(localExpenses));
    } else {
      setExpenses(seedExpenses);
      localStorage.setItem('school_expenses_v3', JSON.stringify(seedExpenses));
    }

    // 3. Incomes
    const localIncomes = localStorage.getItem('school_incomes_v3');
    if (localIncomes) {
      setIncomes(JSON.parse(localIncomes));
    } else {
      setIncomes(seedIncomes);
      localStorage.setItem('school_incomes_v3', JSON.stringify(seedIncomes));
    }

    // 4. Closed state
    const localClosed = localStorage.getItem('school_month_closed_v3');
    if (localClosed) {
      setIsMonthClosed(JSON.parse(localClosed));
    }

    setIsMounted(true);
  }, []);

  // Write changes to localStorage when state modifies
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('school_categories_v3', JSON.stringify(categories));
    }
  }, [categories, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('school_expenses_v3', JSON.stringify(expenses));
    }
  }, [expenses, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('school_incomes_v3', JSON.stringify(incomes));
    }
  }, [incomes, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('school_month_closed_v3', JSON.stringify(isMonthClosed));
    }
  }, [isMonthClosed, isMounted]);

  // Helpers for Toast notifications
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToasts(prev => [...prev, {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    }]);
  };

  // Rule: Dynamic Status auto-adjustment
  const processedExpenses = useMemo(() => {
    return expenses.map(e => {
      if (e.status === 'pendente' && e.dueDate < currentDate) {
        return { ...e, status: 'atrasado' as TransactionStatus };
      }
      return e;
    });
  }, [expenses, currentDate]);

  const cardsData = useMemo(() => {
    const activeIncomes = incomes;
    const activeExpenses = processedExpenses.filter(e => e.status !== 'cancelado');

    const grossRevenue = activeIncomes.reduce((sum, i) => sum + i.amount, 0);
    const paidExpenses = activeExpenses
      .filter(e => e.status === 'pago')
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = activeExpenses
      .filter(e => e.status === 'pendente' && e.dueDate >= currentDate)
      .reduce((sum, e) => sum + e.amount, 0);
    const overdueExpenses = activeExpenses
      .filter(e => e.status === 'atrasado' || (e.status === 'pendente' && e.dueDate < currentDate))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const countExpenses = activeExpenses.length;

    return {
      grossRevenue,
      paidExpenses,
      pendingExpenses,
      overdueExpenses,
      totalExpenses,
      countExpenses,
      countIncomes: activeIncomes.length,
    };
  }, [processedExpenses, incomes, currentDate]);

  // Statistics for Accounts Payable View
  const payablesStats = useMemo(() => {
    const active = processedExpenses.filter(e => e.status !== 'cancelado');
    const pendingList = active.filter(e => e.status === 'pendente' && e.dueDate >= currentDate);
    const overdueList = active.filter(e => e.status === 'atrasado' || (e.status === 'pendente' && e.dueDate < currentDate));

    const totalToPay = pendingList.reduce((sum, e) => sum + e.amount, 0);
    const totalOverdue = overdueList.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalToPay,
      totalOverdue,
      countPending: pendingList.length,
      countOverdue: overdueList.length,
    };
  }, [processedExpenses, currentDate]);

  // Filter lists based on categories and quick filters (Enforces PM filter options)
  const filteredExpenses = useMemo(() => {
    return processedExpenses.filter(e => {
      // Category filter
      if (selectedCategoryName) {
        const cat = categories.find(c => c.id === e.categoryId);
        if (!cat || cat.name !== selectedCategoryName) return false;
      }
      // Quick filter
      if (quickFilter === 'payables') {
        if (e.status !== 'pendente' && e.status !== 'atrasado') return false;
      }
      // Text description search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = e.description.toLowerCase().includes(query);
        const supplierMatch = e.supplier.toLowerCase().includes(query);
        if (!descMatch && !supplierMatch) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      // Payment method
      if (paymentMethodFilter !== 'all' && e.paymentMethod !== paymentMethodFilter) return false;
      // Cost center
      if (costCenterFilter.trim() && (!e.costCenter || !e.costCenter.toLowerCase().includes(costCenterFilter.toLowerCase()))) return false;
      // Min amount
      if (minAmountFilter && e.amount < parseFloat(minAmountFilter)) return false;
      // Max amount
      if (maxAmountFilter && e.amount > parseFloat(maxAmountFilter)) return false;

      return true;
    });
  }, [processedExpenses, selectedCategoryName, quickFilter, searchQuery, statusFilter, paymentMethodFilter, costCenterFilter, minAmountFilter, maxAmountFilter, categories]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => {
      // Category filter
      if (selectedCategoryName) {
        const cat = categories.find(c => c.id === i.categoryId);
        if (!cat || cat.name !== selectedCategoryName) return false;
      }
      // Text description search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = i.description.toLowerCase().includes(query);
        const sourceMatch = i.source.toLowerCase().includes(query);
        if (!descMatch && !sourceMatch) return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter !== 'pago') return false; // Incomes are always paid/received
      }
      // Payment method
      if (paymentMethodFilter !== 'all' && i.paymentMethod !== paymentMethodFilter) return false;
      // Min amount
      if (minAmountFilter && i.amount < parseFloat(minAmountFilter)) return false;
      // Max amount
      if (maxAmountFilter && i.amount > parseFloat(maxAmountFilter)) return false;

      return true;
    });
  }, [incomes, selectedCategoryName, searchQuery, statusFilter, paymentMethodFilter, minAmountFilter, maxAmountFilter, categories]);

  // Reset filter operations
  const handleResetFilters = () => {
    setSelectedCategoryName(null);
    setQuickFilter('all');
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setCostCenterFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
  };

  // Operations: SAVE (ADD or EDIT)
  const handleSaveExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isEdit = !!data.id;
    
    if (isMonthClosed && data.status === 'pago') {
      setClosedMonthAlertTriggered(true);
      return;
    }

    if (isEdit) {
      // Edit
      const old = expenses.find(e => e.id === data.id);
      if (isMonthClosed && old && old.status === 'pago') {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setExpenses(prev => prev.map(e => e.id === data.id ? {
        ...e,
        ...data,
        updatedAt: new Date().toISOString(),
      } as Expense : e));

      addToast('success', 'Despesa Atualizada', `"${data.description}" foi salva com sucesso.`);
    } else {
      // New
      const newExp: Expense = {
        ...data,
        id: `exp-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Expense;

      setExpenses(prev => [newExp, ...prev]);
      addToast('success', 'Despesa Adicionada', `"${data.description}" foi adicionada no fluxo de caixa.`);
    }
  };

  const handleSaveIncome = (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isEdit = !!data.id;

    if (isMonthClosed) {
      setClosedMonthAlertTriggered(true);
      return;
    }

    if (isEdit) {
      // Edit
      setIncomes(prev => prev.map(i => i.id === data.id ? {
        ...i,
        ...data,
        updatedAt: new Date().toISOString(),
      } as Income : i));

      addToast('success', 'Receita Atualizada', `"${data.description}" foi salva com sucesso.`);
    } else {
      // New
      const newInc: Income = {
        ...data,
        id: `inc-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Income;

      setIncomes(prev => [newInc, ...prev]);
      addToast('success', 'Receita Adicionada', `"${data.description}" foi adicionada.`);
    }
  };

  // Operations: DELETE
  const handleDeleteTrigger = (id: string, type: 'despesa' | 'receita') => {
    if (type === 'despesa') {
      const target = expenses.find(e => e.id === id);
      if (!target) return;

      if (isMonthClosed && target.status === 'pago') {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setDeleteConfirmState({
        isOpen: true,
        title: 'Excluir Despesa',
        itemName: target.description,
        warningText: 'Essa ação removerá a despesa do contas a pagar permanentemente.',
        onConfirm: () => {
          setExpenses(prev => prev.filter(e => e.id !== id));
          addToast('success', 'Despesa Excluída', `O registro "${target.description}" foi removido.`);
        },
      });
    } else {
      const target = incomes.find(i => i.id === id);
      if (!target) return;

      if (isMonthClosed) {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setDeleteConfirmState({
        isOpen: true,
        title: 'Excluir Receita',
        itemName: target.description,
        warningText: 'Essa ação removerá o registro de entrada permanentemente.',
        onConfirm: () => {
          setIncomes(prev => prev.filter(i => i.id !== id));
          addToast('success', 'Receita Excluída', `O registro "${target.description}" foi removido.`);
        },
      });
    }
  };

  // Operations: PAY/LIQUIDATE (Dar Baixa)
  const handlePayTrigger = (id: string) => {
    const target = processedExpenses.find(e => e.id === id);
    if (target) {
      setPaymentConfirmState({
        isOpen: true,
        expense: target,
      });
    }
  };

  const handlePayConfirm = (id: string, payDate: string, method: string, notes?: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'pago' as TransactionStatus,
          paymentDate: payDate,
          paymentMethod: method,
          notes: notes || e.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return e;
    }));

    const target = expenses.find(e => e.id === id);
    addToast(
      'success',
      'Liquidação Confirmada',
      `A despesa "${target?.description || 'Despesa'}" foi baixada com sucesso.`
    );
  };

  // Operations: CANCEL EXPENSE
  const handleCancelExpense = (id: string) => {
    if (isMonthClosed) {
      setClosedMonthAlertTriggered(true);
      return;
    }
    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'cancelado' as TransactionStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return e;
    }));
    const target = expenses.find(e => e.id === id);
    addToast('success', 'Despesa Cancelada', `A despesa "${target?.description || 'Despesa'}" foi cancelada.`);
  };

  // Operations: EDIT Dispatcher
  const handleEditTrigger = (id: string, type: 'despesa' | 'receita') => {
    if (type === 'despesa') {
      const target = expenses.find(e => e.id === id);
      if (!target) return;

      if (isMonthClosed && target.status === 'pago') {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setEditingTransaction(target);
      setIsExpenseFormOpen(true);
    } else {
      const target = incomes.find(i => i.id === id);
      if (!target) return;

      if (isMonthClosed) {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setEditingTransaction(target);
      setIsIncomeFormOpen(true);
    }
  };

  const handleViewDetails = (id: string, type: 'despesa' | 'receita') => {
    if (type === 'despesa') {
      const target = processedExpenses.find(e => e.id === id);
      if (target) {
        setSelectedDetailTransaction(target);
      }
    } else {
      const target = incomes.find(i => i.id === id);
      if (target) {
        setSelectedDetailTransaction(target);
      }
    }
  };

  // Operations: CATEGORIES manager
  const handleAddCategory = (newCat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cat: Category = {
      ...newCat,
      id: `cat-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, cat]);
    addToast('success', 'Categoria Cadastrada', `A categoria "${cat.name}" foi criada com sucesso.`);
  };

  // Callback to support inline categories registration from inside transaction creation forms
  const handleAddCategoryInline = (newCat: Category) => {
    setCategories(prev => [...prev, newCat]);
    addToast('success', 'Categoria Criada', `A nova categoria "${newCat.name}" foi cadastrada e selecionada.`);
  };

  const handleUpdateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? {
      ...c,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    } as Category : c));
    addToast('success', 'Categoria Atualizada', 'A categoria foi atualizada no painel escolar.');
  };

  const handleDeleteCategory = (id: string): boolean => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast('success', 'Categoria Removida', 'A categoria foi removida com sucesso.');
    return true;
  };

  // Operations: CLOSE / REOPEN MONTH
  const handleCloseMonthConfirm = () => {
    setIsMonthClosed(true);
    addToast('info', 'Competência Encerrada', 'Competência de Julho/2026 trancada. Lançamentos quitados bloqueados.');
  };

  const handleReopenMonthConfirm = () => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Reabrir Competência Financeira',
      itemName: 'Competência Julho/2026',
      warningText: 'A reabertura liberará modificações em lançamentos quitados neste mês.',
      onConfirm: () => {
        setIsMonthClosed(false);
        addToast('success', 'Competência Reaberta', 'Julho/2026 reaberto para edições.');
      },
    });
  };

  // Reset to original Seeds for Clean state testing in v3 key namespaces
  const handleResetToSeeds = () => {
    setCategories(seedCategories);
    setExpenses(seedExpenses);
    setIncomes(seedIncomes);
    setIsMonthClosed(false);
    localStorage.setItem('school_categories_v3', JSON.stringify(seedCategories));
    localStorage.setItem('school_expenses_v3', JSON.stringify(seedExpenses));
    localStorage.setItem('school_incomes_v3', JSON.stringify(seedIncomes));
    localStorage.setItem('school_month_closed_v3', JSON.stringify(false));
    addToast('info', 'Dados Limpos', 'O sistema foi reiniciado com apenas 1 registro de teste.');
  };

  // Helper: get display title for current tab
  const tabTitle = activeTab === 'overview' ? 'Dashboard' : activeTab === 'expenses' ? 'Despesas' : activeTab === 'categories' ? 'Categorias' : 'Relatórios';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#F4F5F7' }}>

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside style={{ width: '232px', backgroundColor: '#1E3280', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Logo block */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/cebs-logo.png"
              alt="CEBS"
              style={{ width: '38px', height: '38px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
            />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>CEBS</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financeiro</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px 8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '8px 10px 5px' }}>Principal</p>

          {([
            { id: 'overview',    label: 'Dashboard',  Icon: LayoutDashboard },
            { id: 'expenses',    label: 'Despesas',   Icon: Receipt },
            { id: 'categories',  label: 'Categorias', Icon: Tags },
            { id: 'reports',     label: 'Relatórios', Icon: BarChart3 },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                padding: '8px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '13px', textAlign: 'left', marginBottom: '1px',
                fontWeight: activeTab === id ? 700 : 500,
                color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.55)',
                backgroundColor: activeTab === id ? 'rgba(255,255,255,0.13)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              {label}
              {id === 'expenses' && payablesStats.countPending + payablesStats.countOverdue > 0 && (
                <span style={{ marginLeft: 'auto', padding: '1px 6px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                  {payablesStats.countPending + payablesStats.countOverdue}
                </span>
              )}
            </button>
          ))}

          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '16px 10px 5px' }}>Sistema</p>
          {([
            { label: 'Usuários', Icon: Users },
            { label: 'Configurações', Icon: Settings },
          ] as const).map(({ label, Icon }) => (
            <button key={label} style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '8px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, textAlign: 'left', marginBottom: '1px', color: 'rgba(255,255,255,0.45)', backgroundColor: 'transparent', transition: 'all 0.15s' }}>
              <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </nav>

        {/* Sidebar bottom */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '10px', fontWeight: 500, lineHeight: 1.55 }}>Centro Educacional<br />Batista Sobrinho</p>
        </div>
      </aside>

      {/* ═══════════════ MAIN AREA ═══════════════ */}
      <div style={{ marginLeft: '232px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── TOP BAR ── */}
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8E9EC', padding: '0 32px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, gap: '16px' }}>

          {/* Left: current page title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', lineHeight: 1 }}>{tabTitle}</h1>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>CEBS Financeiro · Julho/2026</p>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>

            {/* Month status pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 11px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: isMonthClosed ? '#EAF5F0' : '#FFF8EB', color: isMonthClosed ? '#2E7D57' : '#B9891C', border: `1px solid ${isMonthClosed ? 'rgba(46,125,87,0.18)' : 'rgba(185,137,28,0.18)'}` }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isMonthClosed ? '#2E7D57' : '#B9891C', display: 'inline-block', flexShrink: 0 }} />
              {isMonthClosed ? 'Fechado' : 'Aberto'}
            </div>

            {/* Lock/Unlock month */}
            <button
              onClick={isMonthClosed ? handleReopenMonthConfirm : () => setIsCloseMonthModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 11px', borderRadius: '7px', border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {isMonthClosed ? <Unlock style={{ width: '13px', height: '13px' }} /> : <Lock style={{ width: '13px', height: '13px' }} />}
              {isMonthClosed ? 'Reabrir' : 'Fechar mês'}
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#E5E7EB', flexShrink: 0, margin: '0 3px' }} />

            {/* Categories */}
            <button onClick={() => setIsCategoryManagerOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
              <Tags style={{ width: '13px', height: '13px', color: '#1E3280' }} />
              Categorias
            </button>

            {/* Nova Receita */}
            <button
              onClick={() => { setEditingTransaction(null); setIsIncomeFormOpen(true); }}
              disabled={isMonthClosed}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: isMonthClosed ? 'not-allowed' : 'pointer', opacity: isMonthClosed ? 0.4 : 1, transition: 'all 0.15s' }}
            >
              <PlusCircle style={{ width: '13px', height: '13px', color: '#1E3280' }} />
              Nova Receita
            </button>

            {/* Nova Despesa — primary */}
            <button
              onClick={() => { setEditingTransaction(null); setIsExpenseFormOpen(true); }}
              disabled={isMonthClosed}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '7px', border: '1.5px solid #1E3280', backgroundColor: '#1E3280', color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: isMonthClosed ? 'not-allowed' : 'pointer', opacity: isMonthClosed ? 0.4 : 1, transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(30,50,128,0.25)' }}
            >
              <PlusCircle style={{ width: '13px', height: '13px' }} />
              Nova Despesa
            </button>

            {/* Reset ghost */}
            <button onClick={handleResetToSeeds} title="Limpar dados de demonstração" style={{ padding: '6px 8px', borderRadius: '7px', border: '1.5px solid transparent', backgroundColor: 'transparent', color: '#C4C9D1', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
              Limpar
            </button>
          </div>
        </header>

        {/* ── SUB-TABS ── */}
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8E9EC', padding: '0 32px', display: 'flex', alignItems: 'center' }}>
          {([
            { id: 'overview',   label: 'Visão Geral' },
            { id: 'expenses',   label: 'Despesas' },
            { id: 'categories', label: 'Categorias' },
            { id: 'reports',    label: 'Relatórios' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '13px 20px', fontSize: '13px', fontFamily: 'inherit',
                fontWeight: activeTab === id ? 600 : 500,
                color: activeTab === id ? '#1E3280' : '#6B7280',
                borderBottom: `2px solid ${activeTab === id ? '#1E3280' : 'transparent'}`,
                border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >{label}</button>
          ))}

          {/* Right side: Contas a Pagar pill + date range */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DateRangeFilter
              currentMonthName="Julho/2026"
              isClosed={isMonthClosed}
              onReset={handleResetFilters}
            />
            <button
              onClick={() => { setLedgerMode('despesa'); setQuickFilter(quickFilter === 'payables' ? 'all' : 'payables'); if (quickFilter !== 'payables') setActiveTab('expenses'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 13px', borderRadius: '99px', border: `1.5px solid ${quickFilter === 'payables' ? '#1E3280' : '#E5E7EB'}`, backgroundColor: quickFilter === 'payables' ? 'rgba(30,50,128,0.07)' : '#fff', color: quickFilter === 'payables' ? '#1E3280' : '#6B7280', fontSize: '11.5px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <CreditCard style={{ width: '12px', height: '12px' }} />
              Contas a Pagar
              {payablesStats.countPending + payablesStats.countOverdue > 0 && (
                <span style={{ padding: '0 5px', borderRadius: '99px', backgroundColor: '#1E3280', color: '#fff', fontSize: '9.5px', fontWeight: 700, lineHeight: '16px' }}>
                  {payablesStats.countPending + payablesStats.countOverdue}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ════════════ CONTENT AREA ════════════ */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

          {/* ─── TAB: VISÃO GERAL (Dashboard) ─── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px' }}>

              {/* Options row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Métricas · Julho/2026</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showRevenueSummary} onChange={(e) => setShowRevenueSummary(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#1E3280', cursor: 'pointer' }} />
                  Mostrar Receitas e Saldo
                </label>
              </div>

              {/* Payables banner (when active) */}
              {quickFilter === 'payables' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', padding: '18px 22px', backgroundColor: '#FFFBEF', borderRadius: '12px', border: '1px solid rgba(185,137,28,0.2)' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>A Pagar no Prazo</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock style={{ width: '16px', height: '16px', color: '#B9891C', flexShrink: 0 }} /><CurrencyValue value={-payablesStats.totalToPay} colorType="neutral" size="lg" /></div>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>{payablesStats.countPending} conta(s)</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Em Atraso</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle style={{ width: '16px', height: '16px', color: '#B94A48', flexShrink: 0 }} /><CurrencyValue value={-payablesStats.totalOverdue} colorType="negative" size="lg" /></div>
                    <p style={{ fontSize: '10px', color: '#B94A48', marginTop: '4px' }}>{payablesStats.countOverdue} vencida(s)</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Saldo Caixa</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Scale style={{ width: '16px', height: '16px', color: '#2E7D57', flexShrink: 0 }} /><CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="lg" /></div>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>Receitas - Pagas</p>
                  </div>
                </div>
              )}

              {/* ── 5 Metric Cards ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>

                {/* Total Despesas */}
                <div className="walltravel-panel walltravel-panel-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Total Despesas</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.totalExpenses} colorType="neutral" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>Todas as contas</p>
                  </div>
                </div>

                {/* Pago */}
                <div className="walltravel-panel walltravel-panel-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Total Pago</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#EAF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2E7D57' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.paidExpenses} colorType="positive" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>Contas quitadas</p>
                  </div>
                </div>

                {/* Pendente */}
                <div className="walltravel-panel walltravel-panel-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Pendente</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock style={{ width: '14px', height: '14px', color: '#B9891C' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.pendingExpenses} colorType="neutral" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>A vencer no prazo</p>
                  </div>
                </div>

                {/* Vencido */}
                <div className="walltravel-panel walltravel-panel-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default', borderLeft: '3px solid #B94A48' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Vencido</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FDF3F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle style={{ width: '14px', height: '14px', color: '#B94A48' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.overdueExpenses} colorType="negative" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#B94A48', marginTop: '5px', fontWeight: 500 }}>Sem baixa / Atrasadas</p>
                  </div>
                </div>

                {/* Lançamentos */}
                <div className="walltravel-panel walltravel-panel-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Lançamentos</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: 'rgba(30,50,128,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderOpen style={{ width: '14px', height: '14px', color: '#1E3280' }} />
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#1E3280', lineHeight: 1.1, display: 'block' }}>{cardsData.countExpenses}</span>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>{cardsData.countExpenses === 1 ? '1 registro' : `${cardsData.countExpenses} registros`}</p>
                  </div>
                </div>
              </div>

              {/* Revenue cards (conditional) */}
              {showRevenueSummary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  <div className="walltravel-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Receita Bruta do Mês</span>
                    <CurrencyValue value={cardsData.grossRevenue} colorType="positive" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{cardsData.countIncomes} recebimento(s)</p>
                  </div>
                  <div className="walltravel-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Resultado Líquido</span>
                    <CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Receitas − Despesas Pagas</p>
                  </div>
                </div>
              )}

              {/* Category preview */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gastos por Categoria</p>
                  <button onClick={() => setActiveTab('expenses')} style={{ fontSize: '12px', color: '#1E3280', fontWeight: 600, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>Ver todas as despesas →</button>
                </div>
                <CategoryCardsGrid
                  categories={categories}
                  expenses={expenses}
                  selectedCategory={selectedCategoryName}
                  onSelectCategory={(name) => { setSelectedCategoryName(name); setActiveTab('expenses'); }}
                />
              </div>
            </div>
          )}

          {/* ─── TAB: DESPESAS ─── */}
          {activeTab === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1400px' }}>

              {/* Category filter */}
              <div>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Filtrar por Categoria</p>
                <CategoryCardsGrid
                  categories={categories}
                  expenses={expenses}
                  selectedCategory={selectedCategoryName}
                  onSelectCategory={setSelectedCategoryName}
                />
              </div>

              {/* Ledger header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {quickFilter === 'payables' ? 'Contas a Pagar' : ledgerMode === 'despesa' ? 'Livro de Despesas' : 'Livro de Receitas'}
                    {selectedCategoryName && <span style={{ padding: '2px 9px', borderRadius: '6px', backgroundColor: 'rgba(30,50,128,0.08)', color: '#1E3280', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(30,50,128,0.14)' }}>{selectedCategoryName}</span>}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px' }}>Gestão de lançamentos para liquidação e controle de fluxo</p>
                </div>

                {/* Mode toggle */}
                <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                  {([['despesa', 'Despesas'], ['receita', 'Receitas']] as const).map(([mode, label]) => (
                    <button key={mode} onClick={() => { setLedgerMode(mode); setQuickFilter('all'); }} style={{ padding: '6px 15px', borderRadius: '6px', border: 'none', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', backgroundColor: ledgerMode === mode && quickFilter === 'all' ? '#fff' : 'transparent', color: ledgerMode === mode && quickFilter === 'all' ? '#1E3280' : '#6B7280', boxShadow: ledgerMode === mode && quickFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search + Filter row */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar por descrição ou fornecedor..." className="walltravel-input" style={{ paddingLeft: '14px', paddingRight: searchQuery ? '60px' : '14px', paddingTop: '9px', paddingBottom: '9px', fontSize: '13px', fontFamily: 'inherit' }} />
                  {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#9CA3AF', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Limpar</button>}
                </div>
                <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '8px', border: `1.5px solid ${showAdvancedFilters ? '#1E3280' : '#E5E7EB'}`, backgroundColor: showAdvancedFilters ? 'rgba(30,50,128,0.06)' : '#fff', color: showAdvancedFilters ? '#1E3280' : '#6B7280', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  <ListFilter style={{ width: '13px', height: '13px' }} />
                  Filtros
                  {(statusFilter !== 'all' || paymentMethodFilter !== 'all' || costCenterFilter.trim() || minAmountFilter || maxAmountFilter) && <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1E3280' }} />}
                </button>
                {(selectedCategoryName || quickFilter !== 'all' || searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all' || costCenterFilter.trim() || minAmountFilter || maxAmountFilter) && (
                  <button onClick={handleResetFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <FilterX style={{ width: '13px', height: '13px' }} />
                    Limpar Filtros
                  </button>
                )}
              </div>

              {/* Advanced filters panel */}
              {showAdvancedFilters && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px 18px', backgroundColor: '#fff', borderRadius: '10px', border: '1.5px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="walltravel-input" style={{ padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit' }}>
                      <option value="all">Todos</option>
                      <option value="pendente">Pendente</option>
                      <option value="atrasado">Vencida</option>
                      <option value="pago">Paga</option>
                      <option value="cancelado">Cancelada</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Forma de Pagamento</span>
                    <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} className="walltravel-input" style={{ padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit' }}>
                      <option value="all">Todas</option>
                      {['PIX', 'Cartão', 'Boleto', 'Dinheiro', 'Transferência', 'Débito automático', 'Outro'].map(pm => <option key={pm} value={pm}>{pm}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Centro de Custo</span>
                    <input type="text" value={costCenterFilter} onChange={(e) => setCostCenterFilter(e.target.value)} placeholder="Filtrar..." className="walltravel-input" style={{ padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Valor (R$)</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="number" value={minAmountFilter} onChange={(e) => setMinAmountFilter(e.target.value)} placeholder="Mín" className="walltravel-input" style={{ padding: '7px 8px', fontSize: '12px', fontFamily: 'inherit', flex: 1 }} />
                      <span style={{ color: '#D1D5DB', fontSize: '12px' }}>—</span>
                      <input type="number" value={maxAmountFilter} onChange={(e) => setMaxAmountFilter(e.target.value)} placeholder="Máx" className="walltravel-input" style={{ padding: '7px 8px', fontSize: '12px', fontFamily: 'inherit', flex: 1 }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              <ExpensesTable
                categories={categories}
                expenses={filteredExpenses}
                incomes={filteredIncomes}
                mode={ledgerMode}
                onPay={handlePayTrigger}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteTrigger}
                onViewDetails={handleViewDetails}
                onClearFilter={selectedCategoryName || quickFilter !== 'all' ? handleResetFilters : undefined}
                isMonthClosed={isMonthClosed}
                onTriggerAdd={() => { setEditingTransaction(null); if (ledgerMode === 'despesa') setIsExpenseFormOpen(true); else setIsIncomeFormOpen(true); }}
              />
            </div>
          )}

          {/* ─── TAB: CATEGORIAS ─── */}
          {activeTab === 'categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Categorias de Despesas</h3>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px' }}>Organize e gerencie as categorias do controle financeiro</p>
                </div>
                <button onClick={() => setIsCategoryManagerOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #1E3280', backgroundColor: '#1E3280', color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 1px 3px rgba(30,50,128,0.25)' }}>
                  <Settings style={{ width: '13px', height: '13px' }} />
                  Gerenciar Categorias
                </button>
              </div>
              <CategoryCardsGrid
                categories={categories}
                expenses={expenses}
                selectedCategory={selectedCategoryName}
                onSelectCategory={(name) => { setSelectedCategoryName(name); setActiveTab('expenses'); }}
              />
            </div>
          )}

          {/* ─── TAB: RELATÓRIOS ─── */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Relatórios</h3>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px' }}>Resumo financeiro do período atual</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {/* Despesas summary */}
                <div className="walltravel-panel" style={{ padding: '22px 24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '14px' }}>Resumo de Despesas</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Total do mês', value: -cardsData.totalExpenses, type: 'neutral' as const },
                      { label: 'Pagas', value: -cardsData.paidExpenses, type: 'positive' as const },
                      { label: 'Pendentes', value: -cardsData.pendingExpenses, type: 'neutral' as const },
                      { label: 'Vencidas', value: -cardsData.overdueExpenses, type: 'negative' as const },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: row.label === 'Vencidas' ? '#B94A48' : '#6B7280', fontWeight: row.label === 'Vencidas' ? 600 : 400 }}>{row.label}</span>
                        <CurrencyValue value={row.value} colorType={row.type} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por categoria */}
                <div className="walltravel-panel" style={{ padding: '22px 24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '14px' }}>Por Categoria</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {categories.filter(c => c.type === 'despesa' && c.active).map(cat => {
                      const catTotal = processedExpenses.filter(e => e.categoryId === cat.id && e.status !== 'cancelado').reduce((s, e) => s + e.amount, 0);
                      if (catTotal === 0) return null;
                      return (
                        <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>{cat.name}</span>
                          <CurrencyValue value={-catTotal} colorType="neutral" size="sm" />
                        </div>
                      );
                    })}
                    {categories.filter(c => c.type === 'despesa' && c.active).every(c => processedExpenses.filter(e => e.categoryId === c.id && e.status !== 'cancelado').reduce((s, e) => s + e.amount, 0) === 0) && (
                      <p style={{ fontSize: '12px', color: '#D1D5DB', textAlign: 'center', padding: '8px 0' }}>Nenhuma despesa registrada</p>
                    )}
                  </div>
                </div>

                {/* Receitas */}
                <div className="walltravel-panel" style={{ padding: '22px 24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '14px' }}>Receitas e Resultado</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Receita bruta</span>
                      <CurrencyValue value={cardsData.grossRevenue} colorType="positive" size="sm" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Lançamentos</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{cardsData.countIncomes}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '4px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Resultado líquido</span>
                      <CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #E8E9EC', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#C4C9D4', fontWeight: 500 }}>CEBS Financeiro © 2026 · Centro Educacional Batista Sobrinho</span>
          <span style={{ fontSize: '11px', color: '#C4C9D4', fontWeight: 500 }}>Competência: Julho/2026</span>
        </footer>
      </div>

      {/* ═══════════════ MODALS ═══════════════ */}
      <ExpenseFormModal isOpen={isExpenseFormOpen} onClose={() => setIsExpenseFormOpen(false)} onSubmit={handleSaveExpense} categories={categories} editingExpense={editingTransaction} onAddCategoryInline={handleAddCategoryInline} />
      <IncomeFormModal isOpen={isIncomeFormOpen} onClose={() => setIsIncomeFormOpen(false)} onSubmit={handleSaveIncome} categories={categories} editingIncome={editingTransaction} onAddCategoryInline={handleAddCategoryInline} />
      <CategoryManagerModal isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} categories={categories} expenses={expenses} incomes={incomes} onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} />
      <DetailsModal isOpen={!!selectedDetailTransaction} onClose={() => setSelectedDetailTransaction(null)} transaction={selectedDetailTransaction} categories={categories} onPay={handlePayTrigger} onDelete={(id) => handleDeleteTrigger(id, selectedDetailTransaction?.type === 'receita' ? 'receita' : 'despesa')} onCancel={handleCancelExpense} />
      <CloseMonthModal isOpen={isCloseMonthModalOpen} onClose={() => setIsCloseMonthModalOpen(false)} expenses={expenses} incomes={incomes} onConfirm={handleCloseMonthConfirm} />
      <ClosedMonthAlert isOpen={closedMonthAlertTriggered} onClose={() => setClosedMonthAlertTriggered(false)} onReopen={handleReopenMonthConfirm} />
      <PaymentConfirmationModal isOpen={paymentConfirmState.isOpen} onClose={() => setPaymentConfirmState({ isOpen: false, expense: null })} onConfirm={handlePayConfirm} transaction={paymentConfirmState.expense} />
      <ConfirmDeleteModal isOpen={deleteConfirmState.isOpen} onClose={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))} onConfirm={deleteConfirmState.onConfirm} title={deleteConfirmState.title} itemName={deleteConfirmState.itemName} warningText={deleteConfirmState.warningText} />

      {/* TOAST */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}


      {/* ===================== SIDEBAR ===================== */}
      <aside className="cebs-sidebar flex-shrink-0">
        {/* Logo Area */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/cebs-logo.png"
              alt="Logo CEBS — Centro Educacional Batista Sobrinho"
              className="w-12 h-12 object-contain flex-shrink-0"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
            />
            <div className="leading-tight min-w-0">
              <div className="text-white font-black text-sm tracking-tight">CEBS</div>
              <div className="text-white/60 font-medium text-[10px] tracking-wide uppercase">Financeiro</div>
            </div>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="text-white/35 text-[9px] font-bold uppercase tracking-widest px-2 pb-2">Menu</p>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white font-semibold text-sm transition-all">
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/65 hover:bg-white/8 hover:text-white font-medium text-sm transition-all">
            <Receipt className="w-4 h-4 flex-shrink-0" />
            <span>Despesas</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/65 hover:bg-white/8 hover:text-white font-medium text-sm transition-all">
            <Tags className="w-4 h-4 flex-shrink-0" onClick={() => setIsCategoryManagerOpen(true)} />
            <span onClick={() => setIsCategoryManagerOpen(true)}>Categorias</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/65 hover:bg-white/8 hover:text-white font-medium text-sm transition-all">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span>Relatórios</span>
          </a>

          <div className="pt-4">
            <p className="text-white/35 text-[9px] font-bold uppercase tracking-widest px-2 pb-2">Conta</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/65 hover:bg-white/8 hover:text-white font-medium text-sm transition-all">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Usuários</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/65 hover:bg-white/8 hover:text-white font-medium text-sm transition-all">
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Configurações</span>
            </a>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/35 text-[10px] font-medium leading-snug">Centro Educacional<br/>Batista Sobrinho</p>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="cebs-main-content flex-1 flex flex-col">

        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-[#E6E1D6] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[#161616] tracking-tight">Dashboard de Despesas</h1>
            <p className="text-xs text-[#666A63] font-medium mt-0.5">CEBS Financeiro · Competência: Julho/2026</p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Reset */}
            <button
              onClick={handleResetToSeeds}
              className="cebs-btn cebs-btn-ghost text-xs px-3 py-1.5"
              title="Resetar dados de demonstração"
            >
              Limpar Dados
            </button>

            {/* Categorias */}
            <button
              onClick={() => setIsCategoryManagerOpen(true)}
              className="cebs-btn cebs-btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Tags className="w-3.5 h-3.5" />
              <span>Categorias</span>
            </button>

            {/* Contas a Pagar */}
            <button
              onClick={() => {
                setLedgerMode('despesa');
                setQuickFilter(quickFilter === 'payables' ? 'all' : 'payables');
              }}
              className={`cebs-btn text-xs px-4 py-2 flex items-center gap-1.5 ${
                quickFilter === 'payables'
                  ? 'bg-[rgba(37,58,138,0.08)] text-[#253A8A] border border-[rgba(37,58,138,0.2)]'
                  : 'cebs-btn-secondary'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Contas a Pagar</span>
              {payablesStats.countPending + payablesStats.countOverdue > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-[#253A8A] text-white leading-none">
                  {payablesStats.countPending + payablesStats.countOverdue}
                </span>
              )}
            </button>

            {/* Nova Receita */}
            <button
              onClick={() => { setEditingTransaction(null); setIsIncomeFormOpen(true); }}
              disabled={isMonthClosed}
              className="cebs-btn cebs-btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova Receita</span>
            </button>

            {/* Nova Despesa */}
            <button
              onClick={() => { setEditingTransaction(null); setIsExpenseFormOpen(true); }}
              disabled={isMonthClosed}
              className="cebs-btn cebs-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova Despesa</span>
            </button>
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="flex-1 px-8 py-8 space-y-8" style={{ maxWidth: '1440px', width: '100%' }}>

      {/* 2. Actions & Filters Line (Restructured to match print layout row) */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1">
        {/* Left Side: Filter and Month link */}
        <DateRangeFilter
          currentMonthName="Julho/2026"
          isClosed={isMonthClosed}
          onReset={handleResetFilters}
        />

        {/* Right Side: Month Closing Status & Lock Button */}
        <div className="flex items-center gap-3.5 self-end sm:self-auto">
          {/* Status Badge: red/pink style for open month, green style for closed */}
          <div className={`flex items-center gap-2.5 px-4.5 py-2.5 text-xs md:text-sm font-black rounded-full border shadow-3xs ${
            isMonthClosed 
              ? 'bg-status-success-bg border-status-success-border text-status-success-text'
              : 'bg-status-overdue-bg border-status-overdue-border text-status-overdue-text'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isMonthClosed ? 'bg-status-success-text animate-pulse' : 'bg-status-overdue-text'
            }`} />
            <span>
              {isMonthClosed ? 'Julho/2026 fechado' : 'Julho/2026 não fechado'}
            </span>
          </div>

          {/* Lock Action Trigger */}
          {isMonthClosed ? (
            <button
              onClick={handleReopenMonthConfirm}
              className="px-5 py-2.5 text-xs md:text-sm font-bold rounded-lg border border-[#E4DFD2] bg-white text-[#161616] hover:bg-[#F7F5EE] shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Unlock className="w-4 h-4 text-[#5F6259]" />
              <span>Reabrir mês</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCloseMonthModalOpen(true)}
              className="px-5 py-2.5 text-xs md:text-sm font-bold rounded-lg border border-[#E4DFD2] bg-white text-[#161616] hover:bg-[#F7F5EE] shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Lock className="w-4 h-4 text-[#5F6259]" />
              <span>Fechar mês</span>
            </button>
          )}
        </div>
      </section>

      {/* Accounts Payable Dashboard Panel (Open Filter warning) */}
      {quickFilter === 'payables' && (
        <section className="p-7 rounded-xl border border-status-pending-border bg-status-pending-bg/50 grid grid-cols-2 md:grid-cols-4 gap-6 text-[#161616] animate-in fade-in slide-in-from-top-2 duration-300 shadow-xs">
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] md:text-xs text-[#5F6259] uppercase tracking-wider font-extrabold">Total a Pagar (Prazo)</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-6 h-6 text-status-pending-text" />
              <CurrencyValue value={-payablesStats.totalToPay} colorType="neutral" size="lg" className="font-extrabold" />
            </div>
            <p className="text-[10px] md:text-xs text-[#5F6259] font-bold">{payablesStats.countPending} contas a vencer</p>
          </div>

          <div className="space-y-1.5 text-left">
            <span className="text-[11px] md:text-xs text-[#5F6259] uppercase tracking-wider font-extrabold">Total em Atraso</span>
            <div className="flex items-center gap-2 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-status-overdue-text" />
              <CurrencyValue value={-payablesStats.totalOverdue} colorType="negative" size="lg" />
            </div>
            <p className="text-[10px] md:text-xs text-status-overdue-text font-bold">{payablesStats.countOverdue} contas vencidas</p>
          </div>

          <div className="space-y-1.5 text-left">
            <span className="text-[11px] md:text-xs text-[#5F6259] uppercase tracking-wider font-extrabold">Saldo Caixa Atual</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Scale className="w-6 h-6 text-status-success-text" />
              <CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="lg" />
            </div>
            <p className="text-[10px] md:text-xs text-[#5F6259] font-bold">Balanço líquido real</p>
          </div>

          <div className="space-y-1.5 text-left">
            <span className="text-[11px] md:text-xs text-[#5F6259] uppercase tracking-wider font-extrabold">Status Operacional</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isMonthClosed ? 'bg-status-overdue-text' : 'bg-status-success-text'}`} />
              <span className="text-sm font-black text-[#161616]">
                {isMonthClosed ? 'Competência Trancada' : 'Fluxo Aberto'}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-[#5F6259] font-bold">Julho/2026</p>
          </div>
        </section>
      )}

      {/* Section Indicator and Toggle */}
      <div className="flex items-center justify-between mt-2 pt-2">
        <h4 className="text-sm font-extrabold text-[#5F6259] uppercase tracking-wider font-sans">
          Métricas de Despesas do Mês
        </h4>
        <label className="flex items-center gap-2 text-xs font-bold text-[#5F6259] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showRevenueSummary}
            onChange={(e) => setShowRevenueSummary(e.target.checked)}
            className="rounded border-[#E4DFD2] text-[#173B72] focus:ring-[#173B72] w-4 h-4 cursor-pointer"
          />
          <span>Mostrar Receitas e Saldo</span>
        </label>
      </div>

      {/* 3. Summary Cards (Cohesive block of clean school dashboard metrics) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Card 1: Total de despesas do mês */}
        <div className="walltravel-panel p-7 flex flex-col justify-between h-[165px] walltravel-panel-hover transition-all text-left">
          <div className="flex items-start justify-between text-[#6B6B63]">
            <span className="text-[12px] font-black uppercase tracking-wider font-sans text-slate-500">Total Despesas do Mês</span>
            <div className="text-slate-400 font-bold text-lg select-none">$</div>
          </div>
          <div className="mt-auto">
            <CurrencyValue value={-cardsData.totalExpenses} colorType="neutral" size="3xl" className="text-[#161616] font-extrabold" />
            <p className="text-[12px] text-[#6B6B63] font-semibold mt-2.5 leading-none">
              Soma de todas as contas
            </p>
          </div>
        </div>

        {/* Card 2: Total Pago */}
        <div className="walltravel-panel p-7 flex flex-col justify-between h-[165px] walltravel-panel-hover transition-all text-left">
          <div className="flex items-start justify-between text-[#6B6B63]">
            <span className="text-[12px] font-black uppercase tracking-wider font-sans text-slate-500">Total Pago</span>
            <div className="text-slate-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-auto">
            <CurrencyValue value={-cardsData.paidExpenses} colorType="positive" size="3xl" />
            <p className="text-[12px] text-[#6B6B63] font-semibold mt-2.5 leading-none">
              Contas quitadas no mês
            </p>
          </div>
        </div>

        {/* Card 3: Total Pendente */}
        <div className="walltravel-panel p-7 flex flex-col justify-between h-[165px] walltravel-panel-hover transition-all text-left">
          <div className="flex items-start justify-between text-[#6B6B63]">
            <span className="text-[12px] font-black uppercase tracking-wider font-sans text-slate-500">Total Pendente</span>
            <div className="text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-auto">
            <CurrencyValue value={-cardsData.pendingExpenses} colorType="neutral" size="3xl" className="text-status-pending-text font-extrabold" />
            <p className="text-[12px] text-[#6B6B63] font-semibold mt-2.5 leading-none">A vencer no prazo</p>
          </div>
        </div>

        {/* Card 4: Total Vencido */}
        <div className="walltravel-panel p-7 flex flex-col justify-between h-[165px] walltravel-panel-hover transition-all text-left">
          <div className="flex items-start justify-between text-[#6B6B63]">
            <span className="text-[12px] font-black uppercase tracking-wider font-sans text-slate-500">Total Vencido</span>
            <div className="text-slate-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-auto">
            <CurrencyValue value={-cardsData.overdueExpenses} colorType="negative" size="3xl" />
            <p className="text-[12px] text-status-overdue-text font-semibold mt-2.5 leading-none">Atrasadas / Sem baixa</p>
          </div>
        </div>

        {/* Card 5: Quantidade de despesas cadastradas */}
        <div className="walltravel-panel p-7 flex flex-col justify-between h-[165px] walltravel-panel-hover transition-all text-left">
          <div className="flex items-start justify-between text-[#6B6B63]">
            <span className="text-[12px] font-black uppercase tracking-wider font-sans text-slate-500">Despesas Cadastradas</span>
            <div className="text-slate-400">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-auto">
            <span className="text-[32px] font-black text-brand-accent leading-tight">
              {cardsData.countExpenses}
            </span>
            <p className="text-[12px] text-[#6B6B63] font-semibold mt-2.5 leading-none">
              {cardsData.countExpenses === 1 ? '1 lançamento' : `${cardsData.countExpenses} lançamentos`}
            </p>
          </div>
        </div>
      </section>

      {/* Secondary Row: Revenue indicators if showRevenueSummary is checked */}
      {showRevenueSummary && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Receitas Card */}
          <div className="walltravel-panel p-7 flex flex-col justify-between h-[150px] walltravel-panel-hover transition-all text-left">
            <div className="flex items-start justify-between text-[#6B6B63]">
              <span className="text-[12px] font-black uppercase tracking-wider font-sans text-slate-500">Receita Bruta do Mês</span>
              <div className="text-slate-400 font-bold text-lg select-none">$</div>
            </div>
            <div className="mt-auto">
              <CurrencyValue value={cardsData.grossRevenue} colorType="positive" size="3xl" />
              <p className="text-[12px] text-[#6B6B63] font-semibold mt-2 leading-none">
                {cardsData.countIncomes} {cardsData.countIncomes === 1 ? 'recebimento' : 'recebimentos'} no período
              </p>
            </div>
          </div>

          {/* Resultado Líquido */}
          <div className="walltravel-panel p-7 flex flex-col justify-between h-[150px] walltravel-panel-hover transition-all text-left">
            <div className="flex items-start justify-between text-[#6B6B63]">
              <span className="text-[12px] font-black uppercase tracking-wider text-slate-500 font-title">Resultado Líquido</span>
              <div className="text-slate-400">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-auto">
              <CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="3xl" className="text-status-success-text" />
              <p className="text-[12px] text-[#6B6B63] font-semibold mt-2 leading-none">
                Balanço real (Receitas - Despesas Pagas)
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Categories Section */}
      <section className="pt-2">
        <CategoryCardsGrid
          categories={categories}
          expenses={expenses}
          selectedCategory={selectedCategoryName}
          onSelectCategory={setSelectedCategoryName}
        />
      </section>

      {/* 5. Tabela / Livro de Despesas (Spacious visual restructuration) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left font-sans space-y-1">
            <h3 className="text-xl font-extrabold text-[#161616] tracking-wide flex items-center gap-2.5 font-title">
              <ArrowRightLeft className="w-5.5 h-5.5 text-brand-accent" />
              <span>
                {quickFilter === 'payables' 
                  ? 'Contas a Pagar (Despesas Unpaid)' 
                  : (ledgerMode === 'despesa' ? 'Livro de Despesas Escolares' : 'Livro de Receitas / Entradas')
                }
              </span>
              {selectedCategoryName && (
                <span className="text-xs md:text-sm font-bold px-3 py-1 rounded-lg bg-[#EAF2FF] text-[#173B72] border border-[#D8E7FF]">
                  {selectedCategoryName}
                </span>
              )}
            </h3>
            <p className="text-sm text-[#6B6B63] font-semibold">
              Gestão de lançamentos para liquidação, conciliação e relatórios de fluxo
            </p>
          </div>
          
          {/* Tabs switch (Larger text and padding) */}
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#6B6B63] bg-white border border-[#E6E1D6] rounded-lg p-1.5 shadow-xs font-sans">
            <button
              onClick={() => {
                setLedgerMode('despesa');
                setQuickFilter('all');
              }}
              className={`px-5 py-2.5 rounded-md transition-all cursor-pointer ${
                ledgerMode === 'despesa' && quickFilter === 'all' 
                  ? 'bg-brand-accent text-white font-bold shadow-sm' 
                  : 'hover:text-[#161616]'
              }`}
            >
              Despesas
            </button>
            
            <button
              onClick={() => {
                setLedgerMode('receita');
                setQuickFilter('all');
              }}
              className={`px-5 py-2.5 rounded-md transition-all cursor-pointer ${
                ledgerMode === 'receita'
                  ? 'bg-brand-accent text-white font-bold shadow-sm' 
                  : 'hover:text-[#161616]'
              }`}
            >
              Receitas
            </button>
          </div>
        </div>

        {/* Search & Advanced Filters Panel (Notion/Stripe SaaS style) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search query input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por descrição ou fornecedor/origem..."
                className="w-full walltravel-input pl-4 pr-10 py-3.5 text-sm font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-4 text-xs font-bold text-[#6B6B63] hover:text-[#161616] cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Toggle advanced filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-5 py-3.5 text-xs md:text-sm font-bold rounded-lg border border-[#E6E1D6] shadow-2xs flex items-center gap-2 cursor-pointer transition-colors ${
                showAdvancedFilters ? 'bg-[#EAF2FF] text-[#173B72] border-[#173B72]' : 'bg-white text-[#6B6B63] hover:bg-[#F8F7F2]'
              }`}
            >
              <ListFilter className="w-4.5 h-4.5 text-brand-accent" />
              <span>Filtros Avançados</span>
              {(statusFilter !== 'all' || paymentMethodFilter !== 'all' || costCenterFilter.trim() || minAmountFilter || maxAmountFilter) && (
                <span className="w-2 h-2 rounded-full bg-[#173B72] block" />
              )}
            </button>

            {/* Reset all filters (if any is active) */}
            {(selectedCategoryName || quickFilter !== 'all' || searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all' || costCenterFilter.trim() || minAmountFilter || maxAmountFilter) && (
              <button
                onClick={handleResetFilters}
                className="px-5 py-3.5 text-xs md:text-sm font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <FilterX className="w-4 h-4 text-slate-500" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          {/* Advanced filter dropdown details */}
          {showAdvancedFilters && (
            <div className="p-5.5 rounded-lg border border-[#E6E1D6] bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Status Filter */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wide">Filtrar por Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full walltravel-input px-3.5 py-2 text-xs font-semibold"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasado">Vencida</option>
                  <option value="pago">Paga</option>
                  <option value="cancelado">Cancelada</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wide">Forma de Pagamento</span>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full walltravel-input px-3.5 py-2 text-xs font-semibold"
                >
                  <option value="all">Todas as formas</option>
                  {['PIX', 'Cartão', 'Boleto', 'Dinheiro', 'Transferência', 'Débito automático', 'Outro'].map(pm => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>

              {/* Cost Center */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wide">Centro de Custo</span>
                <input
                  type="text"
                  value={costCenterFilter}
                  onChange={(e) => setCostCenterFilter(e.target.value)}
                  placeholder="Filtrar centro..."
                  className="w-full walltravel-input px-3.5 py-2 text-xs font-semibold"
                />
              </div>

              {/* Price range */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-[#6B6B63] uppercase tracking-wide">Intervalo de Valor (R$)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={minAmountFilter}
                    onChange={(e) => setMinAmountFilter(e.target.value)}
                    placeholder="Mín"
                    className="w-full walltravel-input px-3.5 py-2 text-xs font-semibold"
                  />
                  <span className="text-slate-400 font-bold text-xs">-</span>
                  <input
                    type="number"
                    value={maxAmountFilter}
                    onChange={(e) => setMaxAmountFilter(e.target.value)}
                    placeholder="Máx"
                    className="w-full walltravel-input px-3.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <ExpensesTable
          categories={categories}
          expenses={filteredExpenses}
          incomes={filteredIncomes}
          mode={ledgerMode}
          onPay={handlePayTrigger}
          onEdit={handleEditTrigger}
          onDelete={handleDeleteTrigger}
          onViewDetails={handleViewDetails}
          onClearFilter={selectedCategoryName || quickFilter !== 'all' ? handleResetFilters : undefined}
          isMonthClosed={isMonthClosed}
          onTriggerAdd={() => {
            setEditingTransaction(null);
            if (ledgerMode === 'despesa') setIsExpenseFormOpen(true);
            else setIsIncomeFormOpen(true);
          }}
        />
      </section>

      {/* MODALS RENDER */}
      
      {/* 1. Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleSaveExpense}
        categories={categories}
        editingExpense={editingTransaction}
        onAddCategoryInline={handleAddCategoryInline}
      />

      {/* 2. Income Form Modal */}
      <IncomeFormModal
        isOpen={isIncomeFormOpen}
        onClose={() => setIsIncomeFormOpen(false)}
        onSubmit={handleSaveIncome}
        categories={categories}
        editingIncome={editingTransaction}
        onAddCategoryInline={handleAddCategoryInline}
      />

      {/* 3. Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        expenses={expenses}
        incomes={incomes}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* 4. Details Modal */}
      <DetailsModal
        isOpen={!!selectedDetailTransaction}
        onClose={() => setSelectedDetailTransaction(null)}
        transaction={selectedDetailTransaction}
        categories={categories}
        onPay={handlePayTrigger}
        onDelete={(id) => handleDeleteTrigger(id, selectedDetailTransaction?.type === 'receita' ? 'receita' : 'despesa')}
        onCancel={handleCancelExpense}
      />

      {/* 5. Close Month Modal */}
      <CloseMonthModal
        isOpen={isCloseMonthModalOpen}
        onClose={() => setIsCloseMonthModalOpen(false)}
        expenses={expenses}
        incomes={incomes}
        onConfirm={handleCloseMonthConfirm}
      />

      {/* 6. Closed Month Alert Warning */}
      <ClosedMonthAlert
        isOpen={closedMonthAlertTriggered}
        onClose={() => setClosedMonthAlertTriggered(false)}
        onReopen={handleReopenMonthConfirm}
      />

      {/* 7. Payment Confirmation Dialog */}
      <PaymentConfirmationModal
        isOpen={paymentConfirmState.isOpen}
        onClose={() => setPaymentConfirmState({ isOpen: false, expense: null })}
        onConfirm={handlePayConfirm}
        transaction={paymentConfirmState.expense}
      />

      {/* 8. Deletion Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirmState.onConfirm}
        title={deleteConfirmState.title}
        itemName={deleteConfirmState.itemName}
        warningText={deleteConfirmState.warningText}
      />

      {/* TOAST SYSTEM */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-[#E6E1D6] flex items-center justify-between">
        <span className="text-[11px] text-[#9CA3AF] font-medium">CEBS Financeiro &copy; 2026 · Centro Educacional Batista Sobrinho</span>
        <span className="text-[11px] text-[#9CA3AF] font-medium">Competência: Julho/2026</span>
      </footer>

        </div>
      </main>
    </div>
  );
}
