"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Expense, Income, Category, Supplier, TransactionStatus } from '@/types/financial';
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle, Scale, PieChart,
  PlusCircle, FilterX, HelpCircle, ArrowRightLeft, FolderOpen,
  DollarSign, FileSpreadsheet, ListFilter, CheckSquare, Sparkles,
  Lock, Unlock, ChevronRight, Tags, AlertCircle, Trash2, CheckCircle2,
  LayoutDashboard, Receipt, Settings, Users, CreditCard, BarChart3, Menu, Truck, LogOut
} from 'lucide-react';
import DateRangeFilter, { DateRangeOption } from '@/components/DateRangeFilter';
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
  SupplierManagerModal,
  DetailsModal,
  ClosedMonthAlert,
  CloseMonthModal
} from '@/components/Modals';
import { listExpenses, createExpense, updateExpense, payExpense, cancelExpense, deleteExpense } from '@/services/expensesService';
import { listIncomes, createIncome, updateIncome, deleteIncome } from '@/services/incomesService';
import { listCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoriesService';
import { getSchoolSettings, updateSchoolSettings } from '@/services/settingsService';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliersService';
import { loadDemoDataSafely, clearDemoDataSafely } from '@/services/demoSeedService';
import { parseSupabaseError } from '@/lib/supabase/handleSupabaseError';
import { getCurrentSession, signOutUser } from '@/lib/supabase/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isMonthClosed, setIsMonthClosed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'payables'>('all');
  const [ledgerMode, setLedgerMode] = useState<'despesa' | 'receita'>('despesa');
  const [showRevenueSummary, setShowRevenueSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'categories' | 'suppliers' | 'reports' | 'users' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('current');
  const [customStartDate, setCustomStartDate] = useState('2026-07-01');
  const [customEndDate, setCustomEndDate] = useState('2026-07-31');

  // School settings states (persisted)
  const [schoolName, setSchoolName] = useState('Centro Educacional Batista Sobrinho');
  const [schoolNickName, setSchoolNickName] = useState('CEBS');
  const [schoolDocument, setSchoolDocument] = useState('12.345.678/0001-90');
  const [schoolPhone, setSchoolPhone] = useState('(81) 3456-7890');
  const [schoolEmail, setSchoolEmail] = useState('financeiro@cebs.edu.br');
  const [schoolCostCenters, setSchoolCostCenters] = useState('Administração, Pedagógico, Alimentação, Limpeza, Eventos');
  const [schoolPrefAlerts, setSchoolPrefAlerts] = useState(true);
  const [schoolPrefCloseLock, setSchoolPrefCloseLock] = useState(true);

  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
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
  const [isSupplierManagerOpen, setIsSupplierManagerOpen] = useState(false);
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

  const router = useRouter();

  // Auth protection & session listener
  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured()) {
        const session = await getCurrentSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session) {
            router.replace('/login');
          }
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOutUser();
    router.replace('/login');
  };

  // Safe Hydration on mount using database & service layer with fallback
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [fetchedCategories, fetchedSuppliers, fetchedExpenses, fetchedIncomes, fetchedSettings] = await Promise.all([
          listCategories(),
          listSuppliers(),
          listExpenses(),
          listIncomes(),
          getSchoolSettings()
        ]);

        setCategories(fetchedCategories);
        setSuppliers(fetchedSuppliers);
        setExpenses(fetchedExpenses);
        setIncomes(fetchedIncomes);

        if (fetchedSettings.schoolName) setSchoolName(fetchedSettings.schoolName);
        if (fetchedSettings.phone) setSchoolPhone(fetchedSettings.phone);
        if (fetchedSettings.email) setSchoolEmail(fetchedSettings.email);
        if (fetchedSettings.documentNumber) setSchoolDocument(fetchedSettings.documentNumber);

        const localClosed = localStorage.getItem('school_month_closed_v3');
        if (localClosed) {
          setIsMonthClosed(JSON.parse(localClosed));
        }

        const localSettings = localStorage.getItem('school_settings_v3');
        if (localSettings) {
          try {
            const parsed = JSON.parse(localSettings);
            if (parsed.schoolCostCenters) setSchoolCostCenters(parsed.schoolCostCenters);
            if (parsed.schoolPrefAlerts !== undefined) setSchoolPrefAlerts(parsed.schoolPrefAlerts);
            if (parsed.schoolPrefCloseLock !== undefined) setSchoolPrefCloseLock(parsed.schoolPrefCloseLock);
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      } finally {
        setIsMounted(true);
      }
    };

    loadInitialData();
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

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('school_settings_v3', JSON.stringify({
        schoolName,
        schoolNickName,
        schoolDocument,
        schoolPhone,
        schoolEmail,
        schoolCostCenters,
        schoolPrefAlerts,
        schoolPrefCloseLock,
      }));
    }
  }, [schoolName, schoolNickName, schoolDocument, schoolPhone, schoolEmail, schoolCostCenters, schoolPrefAlerts, schoolPrefCloseLock, isMounted]);

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

  // Date range bounds calculation
  const dateBounds = useMemo(() => {
    switch (dateRangeOption) {
      case 'previous':
        return { start: '2026-06-01', end: '2026-06-30', label: '01/06/2026 à 30/06/2026' };
      case '3months':
        return { start: '2026-05-01', end: '2026-07-31', label: '01/05/2026 à 31/07/2026' };
      case '6months':
        return { start: '2026-02-01', end: '2026-07-31', label: '01/02/2026 à 31/07/2026' };
      case 'year':
        return { start: '2026-01-01', end: '2026-12-31', label: 'Ano de 2026' };
      case 'custom':
        return { start: customStartDate, end: customEndDate, label: 'Custom' };
      case 'current':
      default:
        return { start: '2026-07-01', end: '2026-07-31', label: '01/07/2026 à 31/07/2026' };
    }
  }, [dateRangeOption, customStartDate, customEndDate]);

  // Rule: Dynamic Status auto-adjustment
  const processedExpenses = useMemo(() => {
    return expenses.map(e => {
      if (schoolPrefAlerts && e.status === 'pendente' && e.dueDate < currentDate) {
        return { ...e, status: 'atrasado' as TransactionStatus };
      }
      return e;
    });
  }, [expenses, currentDate, schoolPrefAlerts]);

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

  // Monthly evolution calculation for custom evolution chart
  const monthlyEvolution = useMemo(() => {
    const months = [
      { key: '05', label: 'Maio' },
      { key: '06', label: 'Junho' },
      { key: '07', label: 'Julho' },
    ];
    return months.map(m => {
      const total = processedExpenses
        .filter(e => e.status !== 'cancelado' && e.dueDate.startsWith(`2026-${m.key}`))
        .reduce((sum, e) => sum + e.amount, 0);
      return { label: m.label, value: total };
    });
  }, [processedExpenses]);

  // Latest 4 expenses for the recent activity panel
  const latestExpenses = useMemo(() => {
    return [...processedExpenses]
      .filter(e => e.status !== 'cancelado')
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
      .slice(0, 4);
  }, [processedExpenses]);


  // Filter lists based on categories and quick filters (Enforces PM filter options)
  const filteredExpenses = useMemo(() => {
    return processedExpenses.filter(e => {
      // Date bounds filter
      if (e.dueDate < dateBounds.start || e.dueDate > dateBounds.end) return false;
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
      // Supplier filter
      if (supplierFilter !== 'all') {
        const targetSup = suppliers.find(s => s.id === supplierFilter);
        const nameMatch = targetSup && e.supplier?.toLowerCase() === targetSup.name.toLowerCase();
        const idMatch = e.supplierId === supplierFilter;
        if (!nameMatch && !idMatch) return false;
      }
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
  }, [processedExpenses, selectedCategoryName, quickFilter, searchQuery, statusFilter, supplierFilter, suppliers, paymentMethodFilter, costCenterFilter, minAmountFilter, maxAmountFilter, categories, dateBounds]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => {
      // Date bounds filter
      if (i.receivedDate < dateBounds.start || i.receivedDate > dateBounds.end) return false;
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
  }, [incomes, selectedCategoryName, searchQuery, statusFilter, paymentMethodFilter, minAmountFilter, maxAmountFilter, categories, dateBounds]);

  // Reset filter operations
  const handleResetFilters = () => {
    setSelectedCategoryName(null);
    setQuickFilter('all');
    setSearchQuery('');
    setStatusFilter('all');
    setSupplierFilter('all');
    setPaymentMethodFilter('all');
    setCostCenterFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setDateRangeOption('current');
  };

  // Operations: SAVE (ADD or EDIT)
  const handleSaveExpense = async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isEdit = !!data.id;
    
    if (schoolPrefCloseLock && isMonthClosed && data.status === 'pago') {
      setClosedMonthAlertTriggered(true);
      return;
    }

    if (isEdit) {
      const old = expenses.find(e => e.id === data.id);
      if (schoolPrefCloseLock && isMonthClosed && old && old.status === 'pago') {
        setClosedMonthAlertTriggered(true);
        return;
      }

      const res = await updateExpense(data.id!, data);
      if (res.error) {
        const err = parseSupabaseError(res.error);
        addToast('error', err.title, err.message);
        return;
      }
      if (res.data) {
        setExpenses(prev => prev.map(e => e.id === data.id ? res.data! : e));
        addToast('success', 'Despesa Atualizada', `"${data.description}" foi salva com sucesso.`);
      }
    } else {
      const res = await createExpense(data);
      if (res.error) {
        const err = parseSupabaseError(res.error);
        addToast('error', err.title, err.message);
        return;
      }
      if (res.data) {
        setExpenses(prev => [res.data!, ...prev]);
        addToast('success', 'Despesa Adicionada', `"${data.description}" foi adicionada no fluxo de caixa.`);
      }
    }
  };

  const handleSaveIncome = async (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isEdit = !!data.id;

    if (schoolPrefCloseLock && isMonthClosed) {
      setClosedMonthAlertTriggered(true);
      return;
    }

    if (isEdit) {
      const res = await updateIncome(data.id!, data);
      if (res.error) {
        addToast('error', 'Erro ao Atualizar', res.error);
        return;
      }
      if (res.data) {
        setIncomes(prev => prev.map(i => i.id === data.id ? res.data! : i));
        addToast('success', 'Receita Atualizada', `"${data.description}" foi salva com sucesso.`);
      }
    } else {
      const res = await createIncome(data);
      if (res.error) {
        addToast('error', 'Erro ao Cadastrar', res.error);
        return;
      }
      if (res.data) {
        setIncomes(prev => [res.data!, ...prev]);
        addToast('success', 'Receita Adicionada', `"${data.description}" foi adicionada.`);
      }
    }
  };

  // Operations: DELETE
  const handleDeleteTrigger = (id: string, type: 'despesa' | 'receita') => {
    if (type === 'despesa') {
      const target = expenses.find(e => e.id === id);
      if (!target) return;

      if (schoolPrefCloseLock && isMonthClosed && target.status === 'pago') {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setDeleteConfirmState({
        isOpen: true,
        title: 'Excluir Despesa',
        itemName: target.description,
        warningText: 'Essa ação removerá a despesa do contas a pagar permanentemente.',
        onConfirm: async () => {
          const res = await deleteExpense(id);
          if (res.error) {
            addToast('error', 'Erro ao Excluir', res.error);
            return;
          }
          setExpenses(prev => prev.filter(e => e.id !== id));
          addToast('success', 'Despesa Excluída', `O registro "${target.description}" foi removido.`);
        },
      });
    } else {
      const target = incomes.find(i => i.id === id);
      if (!target) return;

      if (schoolPrefCloseLock && isMonthClosed) {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setDeleteConfirmState({
        isOpen: true,
        title: 'Excluir Receita',
        itemName: target.description,
        warningText: 'Essa ação removerá o registro de entrada permanentemente.',
        onConfirm: async () => {
          const res = await deleteIncome(id);
          if (res.error) {
            addToast('error', 'Erro ao Excluir', res.error);
            return;
          }
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

  const handlePayConfirm = async (id: string, payDate: string, method: string, notes?: string) => {
    const res = await payExpense(id, payDate, method);
    if (res.error) {
      addToast('error', 'Erro ao Dar Baixa', res.error);
      return;
    }
    if (res.data) {
      setExpenses(prev => prev.map(e => e.id === id ? res.data! : e));
      addToast('success', 'Liquidação Confirmada', `A despesa "${res.data.description}" foi baixada com sucesso.`);
    }
  };

  // Operations: CANCEL EXPENSE
  const handleCancelExpense = async (id: string) => {
    if (schoolPrefCloseLock && isMonthClosed) {
      setClosedMonthAlertTriggered(true);
      return;
    }
    const res = await cancelExpense(id);
    if (res.error) {
      addToast('error', 'Erro ao Cancelar', res.error);
      return;
    }
    if (res.data) {
      setExpenses(prev => prev.map(e => e.id === id ? res.data! : e));
      addToast('success', 'Despesa Cancelada', `A despesa "${res.data.description}" foi cancelada.`);
    }
  };

  // Operations: EDIT Dispatcher
  const handleEditTrigger = (id: string, type: 'despesa' | 'receita') => {
    if (type === 'despesa') {
      const target = expenses.find(e => e.id === id);
      if (!target) return;

      if (schoolPrefCloseLock && isMonthClosed && target.status === 'pago') {
        setClosedMonthAlertTriggered(true);
        return;
      }

      setEditingTransaction(target);
      setIsExpenseFormOpen(true);
    } else {
      const target = incomes.find(i => i.id === id);
      if (!target) return;

      if (schoolPrefCloseLock && isMonthClosed) {
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
  const handleAddCategory = async (newCat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await createCategory(newCat);
    if (res.error) {
      const err = parseSupabaseError(res.error);
      addToast('error', err.title, err.message);
      return;
    }
    if (res.data) {
      setCategories(prev => [...prev, res.data!]);
      addToast('success', 'Categoria Cadastrada', `A categoria "${res.data.name}" foi criada com sucesso.`);
    }
  };

  // Callback to support inline categories registration from inside transaction creation forms
  const handleAddCategoryInline = async (newCat: Category) => {
    const res = await createCategory(newCat);
    if (res.error) {
      const err = parseSupabaseError(res.error);
      addToast('error', err.title, err.message);
      return;
    }
    if (res.data) {
      setCategories(prev => [...prev, res.data!]);
      addToast('success', 'Categoria Criada', `A nova categoria "${res.data.name}" foi cadastrada e selecionada.`);
    }
  };

  const handleUpdateCategory = async (id: string, updatedFields: Partial<Category>) => {
    const res = await updateCategory(id, updatedFields);
    if (res.error) {
      const err = parseSupabaseError(res.error);
      addToast('error', err.title, err.message);
      return;
    }
    if (res.data) {
      setCategories(prev => prev.map(c => c.id === id ? res.data! : c));
      addToast('success', 'Categoria Atualizada', 'A categoria foi atualizada no painel escolar.');
    }
  };

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    const isUsed = expenses.some(e => e.categoryId === id) || incomes.some(i => i.categoryId === id);
    const res = await deleteCategory(id, isUsed);
    if (!res.success) {
      const err = parseSupabaseError(res.message);
      addToast('error', err.title, err.message);
      return false;
    }
    const updatedCats = await listCategories();
    setCategories(updatedCats);
    addToast('success', 'Categoria Atualizada', res.message);
    return true;
  };

  // Operations: SUPPLIERS manager
  const handleAddSupplier = async (newSup: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await createSupplier(newSup);
    if (res.error) {
      const err = parseSupabaseError(res.error);
      addToast('error', err.title, err.message);
      return;
    }
    if (res.data) {
      setSuppliers(prev => [...prev, res.data!]);
      addToast('success', 'Fornecedor Cadastrado', `O fornecedor "${res.data.name}" foi cadastrado com sucesso.`);
    }
  };

  const handleAddSupplierInline = async (newSup: Supplier) => {
    const res = await createSupplier(newSup);
    if (res.error) {
      const err = parseSupabaseError(res.error);
      addToast('error', err.title, err.message);
      return;
    }
    if (res.data) {
      setSuppliers(prev => [...prev, res.data!]);
      addToast('success', 'Fornecedor Criado', `O novo fornecedor "${res.data.name}" foi cadastrado e selecionado.`);
    }
  };

  const handleUpdateSupplier = async (id: string, updatedFields: Partial<Supplier>) => {
    const res = await updateSupplier(id, updatedFields);
    if (res.error) {
      const err = parseSupabaseError(res.error);
      addToast('error', err.title, err.message);
      return;
    }
    if (res.data) {
      setSuppliers(prev => prev.map(s => s.id === id ? res.data! : s));
      addToast('success', 'Fornecedor Atualizado', 'O fornecedor foi atualizado com sucesso.');
    }
  };

  const handleDeleteSupplier = async (id: string): Promise<boolean> => {
    const targetSup = suppliers.find(s => s.id === id);
    const isUsed = expenses.some(e => e.supplierId === id || (targetSup && e.supplier.toLowerCase() === targetSup.name.toLowerCase()));
    const res = await deleteSupplier(id, isUsed);
    if (!res.success) {
      addToast('error', 'Aviso', res.message);
      return false;
    }
    const updatedSups = await listSuppliers();
    setSuppliers(updatedSups);
    addToast('success', 'Fornecedores Atualizados', res.message);
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

  const handleLoadDemoData = () => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Carregar Dados de Demonstração',
      itemName: '25 Despesas + 12 Fornecedores + 14 Categorias',
      warningText: 'Os dados de teste realistas serão populados no CEBS Financeiro sem duplicar lançamentos.',
      onConfirm: async () => {
        const demoData = await loadDemoDataSafely();
        setCategories(demoData.categories);
        setSuppliers(demoData.suppliers);
        setExpenses(demoData.expenses);
        addToast('success', 'Dados de Demonstração Carregados', 'O CEBS Financeiro foi populado com 25 despesas realistas.');
      },
    });
  };

  const handleClearDemoData = () => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Limpar Dados de Demonstração',
      itemName: 'Despesas de Teste',
      warningText: 'Esta ação irá remover apenas os lançamentos de demonstração.',
      onConfirm: async () => {
        await clearDemoDataSafely();
        const updatedExps = await listExpenses();
        setExpenses(updatedExps);
        addToast('info', 'Dados Demo Limpos', 'Lançamentos de demonstração removidos com sucesso.');
      },
    });
  };

  const handleExportCSV = () => {
    const headers = ['Descricao', 'Categoria', 'Vencimento', 'Valor (R$)', 'Status', 'Forma de Pagamento', 'Fornecedor', 'Centro de Custo', 'Data de Pagamento', 'Observacoes'];
    const rows = processedExpenses.map(e => {
      const cat = categories.find(c => c.id === e.categoryId)?.name || 'Outros';
      return [
        e.description,
        cat,
        e.dueDate,
        e.amount.toFixed(2),
        e.status,
        e.paymentMethod || '—',
        e.supplier || '—',
        e.costCenter || '—',
        e.paymentDate || '—',
        e.notes || '—'
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cebs_relatorio_financeiro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Relatório Exportado', 'O arquivo CSV foi gerado e baixado com sucesso.');
  };

  // Helper: get display title for current tab
  const tabTitle = activeTab === 'overview' ? 'Dashboard de Gastos' : activeTab === 'expenses' ? 'Despesas' : activeTab === 'categories' ? 'Categorias' : activeTab === 'suppliers' ? 'Fornecedores' : activeTab === 'reports' ? 'Relatórios' : activeTab === 'users' ? 'Usuários' : 'Configurações';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#F4F5F7' }}>

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside
        style={{
          width: '232px',
          backgroundColor: '#1E3280',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          transition: 'transform 0.2s ease-in-out',
        }}
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >

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
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1' }}>Financeiro</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px 8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '8px 10px 5px' }}>Principal</p>

          {([
            { id: 'overview',    label: 'Dashboard de Gastos',  Icon: LayoutDashboard },
            { id: 'expenses',    label: 'Despesas',   Icon: Receipt },
            { id: 'categories',  label: 'Categorias', Icon: Tags },
            { id: 'suppliers',   label: 'Fornecedores', Icon: Truck },
            { id: 'reports',     label: 'Relatórios', Icon: BarChart3 },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
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
            { id: 'users',    label: 'Usuários',       Icon: Users },
            { id: 'settings', label: 'Configurações',   Icon: Settings },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
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
            </button>
          ))}
        </nav>

        {/* Sidebar bottom */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '10px', fontWeight: 500, lineHeight: 1.55 }}>Centro Educacional<br />Batista Sobrinho</p>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-45 md:hidden"
        />
      )}

      {/* ═══════════════ MAIN AREA ═══════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s ease-in-out' }} className="ml-0 md:ml-[232px]">

        {/* ── TOP BAR ── */}
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8E9EC', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, gap: '16px' }} className="px-4 md:px-8">

          {/* Left: Hamburger menu (mobile) + current page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 md:hidden bg-white text-slate-600 cursor-pointer focus:outline-none hover:bg-slate-50 transition-colors"
              title="Abrir Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', lineHeight: 1 }}>{tabTitle}</h1>
              <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>CEBS Financeiro · Julho/2026</p>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

            {/* Month status pill — oculta no mobile muito pequeno */}
            <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '5px', padding: '4px 11px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: isMonthClosed ? '#EAF5F0' : '#FFF8EB', color: isMonthClosed ? '#2E7D57' : '#B9891C', border: `1px solid ${isMonthClosed ? 'rgba(46,125,87,0.18)' : 'rgba(185,137,28,0.18)'}` }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isMonthClosed ? '#2E7D57' : '#B9891C', display: 'inline-block', flexShrink: 0 }} />
              {isMonthClosed ? 'Fechado' : 'Aberto'}
            </div>

            {/* Lock/Unlock month */}
            <button
              onClick={isMonthClosed ? handleReopenMonthConfirm : () => setIsCloseMonthModalOpen(true)}
              title={isMonthClosed ? 'Reabrir mês' : 'Fechar mês'}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {isMonthClosed ? <Unlock style={{ width: '13px', height: '13px' }} /> : <Lock style={{ width: '13px', height: '13px' }} />}
              <span className="hidden md:inline">{isMonthClosed ? 'Reabrir' : 'Fechar mês'}</span>
            </button>

            <div className="hidden sm:block" style={{ width: '1px', height: '18px', backgroundColor: '#E5E7EB', flexShrink: 0, margin: '0 2px' }} />

            {/* Categories — hidden on small mobile */}
            <button onClick={() => setIsCategoryManagerOpen(true)} title="Gerenciar Categorias" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
              <Tags style={{ width: '13px', height: '13px', color: '#1E3280' }} />
              <span className="hidden md:inline">Categorias</span>
            </button>

            {/* Nova Receita — hidden on mobile */}
            <button
              onClick={() => { setEditingTransaction(null); setIsIncomeFormOpen(true); }}
              disabled={isMonthClosed}
              title="Nova Receita"
              className="hidden sm:flex"
              style={{ alignItems: 'center', gap: '5px', padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: isMonthClosed ? 'not-allowed' : 'pointer', opacity: isMonthClosed ? 0.4 : 1, transition: 'all 0.15s' }}
            >
              <PlusCircle style={{ width: '13px', height: '13px', color: '#1E3280' }} />
              <span className="hidden md:inline">Nova Receita</span>
            </button>

            {/* Nova Despesa — primary */}
            <button
              onClick={() => { setEditingTransaction(null); setIsExpenseFormOpen(true); }}
              disabled={isMonthClosed}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '7px', border: '1.5px solid #1E3280', backgroundColor: '#1E3280', color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: isMonthClosed ? 'not-allowed' : 'pointer', opacity: isMonthClosed ? 0.4 : 1, transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(30,50,128,0.25)', whiteSpace: 'nowrap' }}
            >
              <PlusCircle style={{ width: '13px', height: '13px' }} />
              <span className="hidden xs:inline">Nova Despesa</span>
            </button>

            {/* Demo Data Controls */}
            <button onClick={handleLoadDemoData} title="Carregar 25 dados de demonstração" className="hidden lg:flex" style={{ alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', border: '1.5px solid rgba(30,50,128,0.2)', backgroundColor: '#F4F6FC', color: '#1E3280', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700 }}>
              <Sparkles style={{ width: '12px', height: '12px' }} />
              <span>Carregar Demo</span>
            </button>

            <button onClick={handleClearDemoData} title="Limpar dados de demonstração" className="hidden lg:block" style={{ padding: '6px 8px', borderRadius: '7px', border: '1.5px solid transparent', backgroundColor: 'transparent', color: '#9CA3AF', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
              Limpar Demo
            </button>

            {/* Botão Sair / Encerrar Sessão */}
            <button
              onClick={handleLogout}
              title="Encerrar Sessão"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 10px',
                borderRadius: '7px',
                border: '1.5px solid #FCA5A5',
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <LogOut style={{ width: '13px', height: '13px', color: '#DC2626' }} />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* ── SUB-TABS ── */}
        {activeTab !== 'users' && activeTab !== 'settings' && (
          <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8E9EC', display: 'flex', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="px-4 md:px-8">
            {([
              { id: 'overview',   label: 'Dashboard' },
              { id: 'expenses',   label: 'Despesas' },
              { id: 'categories', label: 'Categorias' },
              { id: 'reports',    label: 'Relatórios' },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-3 text-xs md:text-sm font-semibold transition-colors border-b-2 cursor-pointer bg-transparent whitespace-nowrap shrink-0 ${
                  activeTab === id
                    ? 'border-[#1E3280] text-[#1E3280]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >{label}</button>
            ))}

            {/* Right side: Contas a Pagar pill + date range (hidden on small mobile) */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <DateRangeFilter
                selectedRange={dateRangeOption}
                onChangeRange={setDateRangeOption}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onChangeCustomDates={(start, end) => { setCustomStartDate(start); setCustomEndDate(end); }}
              />
              <button
                onClick={() => { setLedgerMode('despesa'); setQuickFilter(quickFilter === 'payables' ? 'all' : 'payables'); if (quickFilter !== 'payables') setActiveTab('expenses'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '99px', border: `1.5px solid ${quickFilter === 'payables' ? '#1E3280' : '#E5E7EB'}`, backgroundColor: quickFilter === 'payables' ? 'rgba(30,50,128,0.07)' : '#fff', color: quickFilter === 'payables' ? '#1E3280' : '#6B7280', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              >
                <CreditCard style={{ width: '12px', height: '12px' }} />
                <span className="hidden sm:inline">Contas a Pagar</span>
                {payablesStats.countPending + payablesStats.countOverdue > 0 && (
                  <span style={{ padding: '0 5px', borderRadius: '99px', backgroundColor: '#1E3280', color: '#fff', fontSize: '9.5px', fontWeight: 700, lineHeight: '16px' }}>
                    {payablesStats.countPending + payablesStats.countOverdue}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════════ CONTENT AREA ════════════ */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="p-4 md:p-8">

          {/* ─── TAB: VISÃO GERAL (Dashboard de Gastos) ─── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px' }}>

              {/* Header section with toggle option */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Indicadores Gerais</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showRevenueSummary} onChange={(e) => setShowRevenueSummary(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#1E3280', cursor: 'pointer' }} />
                  Mostrar Receitas e Saldo de Caixa
                </label>
              </div>

              {/* Payables banner (when quick filter payables is active) */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {/* Total Despesas */}
                <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Total Despesas</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.totalExpenses} colorType="neutral" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>Lançadas no período</p>
                  </div>
                </div>

                {/* Pago */}
                <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Total Pago</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#EAF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2E7D57' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.paidExpenses} colorType="positive" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>Contas liquidadas</p>
                  </div>
                </div>

                {/* Pendente */}
                <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid #B94A48' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Vencido</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FDF3F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle style={{ width: '14px', height: '14px', color: '#B94A48' }} />
                    </div>
                  </div>
                  <div>
                    <CurrencyValue value={-cardsData.overdueExpenses} colorType="negative" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#B94A48', marginTop: '5px', fontWeight: 500 }}>Contas atrasadas</p>
                  </div>
                </div>

                {/* Lançamentos */}
                <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Lançamentos</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: 'rgba(30,50,128,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderOpen style={{ width: '14px', height: '14px', color: '#1E3280' }} />
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#1E3280', lineHeight: 1.1, display: 'block' }}>{cardsData.countExpenses}</span>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>{cardsData.countExpenses === 1 ? '1 despesa' : `${cardsData.countExpenses} despesas`}</p>
                  </div>
                </div>
              </div>

              {/* Revenue cards (conditional) */}
              {showRevenueSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" style={{ animation: 'cebsFadeIn 0.2s ease forwards' }}>
                  <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Receita Bruta do Mês</span>
                    <CurrencyValue value={cardsData.grossRevenue} colorType="positive" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{cardsData.countIncomes} recebimento(s)</p>
                  </div>
                  <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Resultado Líquido</span>
                    <CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="2xl" />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Balanço (Receitas − Despesas Pagas)</p>
                  </div>
                </div>
              )}

              {/* ── CHARTS SECTION (2 columns) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">

                {/* Evolution & Status distribution */}
                <div className="cebs-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  
                  {/* Status distribution bar */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Distribuição de Gastos por Status</h4>
                    
                    {/* Horizontal Segmented Bar */}
                    <div style={{ height: '24px', borderRadius: '6px', overflow: 'hidden', display: 'flex', backgroundColor: '#E5E7EB', width: '100%', marginBottom: '14px' }}>
                      {cardsData.totalExpenses > 0 ? (
                        <>
                          {cardsData.paidExpenses > 0 && (
                            <div
                              style={{ width: `${(cardsData.paidExpenses / cardsData.totalExpenses) * 100}%`, backgroundColor: '#2E7D57', transition: 'all 0.3s' }}
                              title={`Pago: ${((cardsData.paidExpenses / cardsData.totalExpenses) * 100).toFixed(0)}%`}
                            />
                          )}
                          {cardsData.pendingExpenses > 0 && (
                            <div
                              style={{ width: `${(cardsData.pendingExpenses / cardsData.totalExpenses) * 100}%`, backgroundColor: '#B9891C', transition: 'all 0.3s' }}
                              title={`Pendente: ${((cardsData.pendingExpenses / cardsData.totalExpenses) * 100).toFixed(0)}%`}
                            />
                          )}
                          {cardsData.overdueExpenses > 0 && (
                            <div
                              style={{ width: `${(cardsData.overdueExpenses / cardsData.totalExpenses) * 100}%`, backgroundColor: '#B94A48', transition: 'all 0.3s' }}
                              title={`Vencido: ${((cardsData.overdueExpenses / cardsData.totalExpenses) * 100).toFixed(0)}%`}
                            />
                          )}
                        </>
                      ) : (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '11px', fontWeight: 500 }}>Nenhuma despesa para exibir no período</div>
                      )}
                    </div>

                    {/* Chart Legends */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2E7D57' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2E7D57' }} />
                        Pago ({cardsData.totalExpenses > 0 ? ((cardsData.paidExpenses / cardsData.totalExpenses) * 100).toFixed(0) : 0}%)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#B9891C' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#B9891C' }} />
                        Pendente ({cardsData.totalExpenses > 0 ? ((cardsData.pendingExpenses / cardsData.totalExpenses) * 100).toFixed(0) : 0}%)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#B94A48' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#B94A48' }} />
                        Vencido ({cardsData.totalExpenses > 0 ? ((cardsData.overdueExpenses / cardsData.totalExpenses) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#E5E7EB' }} />

                  {/* Monthly Evolution Block */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Evolução Mensal das Despesas</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', padding: '10px 0 5px', borderBottom: '1.5px solid #E5E7EB' }}>
                      {monthlyEvolution.map(m => {
                        // Max value in monthly evolution to calculate bar height
                        const maxVal = Math.max(...monthlyEvolution.map(x => x.value), 1000);
                        const pctHeight = (m.value / maxVal) * 100;
                        return (
                          <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#374151' }}>R$ {m.value.toFixed(0)}</span>
                            
                            {/* Bar item */}
                            <div
                              style={{
                                width: '32px',
                                height: `${Math.max(pctHeight, 4)}px`,
                                backgroundColor: m.value > 0 ? '#1E3280' : '#E5E7EB',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.4s ease'
                              }}
                            />
                            
                            <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Resumo por categoria */}
                <div className="cebs-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gastos por Categoria</h4>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Distribuição das despesas do período</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '270px', overflowY: 'auto', paddingRight: '4px' }}>
                    {categories.filter(c => c.type === 'despesa' && c.active).map(cat => {
                      const amount = processedExpenses.filter(e => e.categoryId === cat.id && e.status !== 'cancelado').reduce((sum, e) => sum + e.amount, 0);
                      const percentage = cardsData.totalExpenses > 0 ? (amount / cardsData.totalExpenses) * 100 : 0;
                      if (amount === 0) return null;
                      return (
                        <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600 }}>
                            <span style={{ color: '#4B5563' }}>{cat.name}</span>
                            <span style={{ color: '#111827' }}>R$ {amount.toFixed(2)} <span style={{ color: '#9CA3AF', fontSize: '10px', marginLeft: '2px' }}>({percentage.toFixed(0)}%)</span></span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div style={{ height: '6px', borderRadius: '99px', backgroundColor: '#F3F4F6', width: '100%', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${percentage}%`,
                                backgroundColor: `var(--color-${cat.color}-primary, #1E3280)`,
                                borderRadius: '99px'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty categories state */}
                    {categories.filter(c => c.type === 'despesa').every(cat => processedExpenses.filter(e => e.categoryId === cat.id && e.status !== 'cancelado').reduce((s, e) => s + e.amount, 0) === 0) && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>Nenhuma despesa registrada para as categorias ativas.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* ── LATEST EXPENSES BLOCK ── */}
              <div className="cebs-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Últimas Despesas Lançadas</h4>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Atividade financeira recente</p>
                  </div>
                  <button onClick={() => setActiveTab('expenses')} style={{ fontSize: '12px', color: '#1E3280', fontWeight: 700, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>Ver todo o livro →</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #F3F4F6', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '10px 12px' }}>Descrição</th>
                        <th style={{ padding: '10px 12px' }}>Categoria</th>
                        <th style={{ padding: '10px 12px' }}>Vencimento</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Valor</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                      {latestExpenses.map(exp => {
                        const cat = categories.find(c => c.id === exp.categoryId);
                        return (
                          <tr key={exp.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontWeight: 700, color: '#111827', display: 'block' }}>{exp.description}</span>
                              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{exp.supplier}</span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, color: `var(--color-${cat?.color || 'zinc'}-primary, #374151)`, backgroundColor: `var(--color-${cat?.color || 'zinc'}-dark, #F3F4F6)` }}>
                                {cat?.name || 'Outros'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {exp.dueDate.split('-').reverse().join('/')}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#B94A48' }}>
                              -R$ {exp.amount.toFixed(2)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: '99px', fontSize: '10.5px', fontWeight: 700,
                                color: exp.status === 'pago' ? '#2E7D57' : exp.status === 'pendente' ? '#B9891C' : exp.status === 'atrasado' ? '#B94A48' : '#7A7E77',
                                backgroundColor: exp.status === 'pago' ? '#EAF5F0' : exp.status === 'pendente' ? '#FFF8EB' : exp.status === 'atrasado' ? '#FDF3F3' : '#F3F4F6'
                              }}>
                                {exp.status === 'pago' ? 'Pago' : exp.status === 'pendente' ? 'Pendente' : exp.status === 'atrasado' ? 'Vencido' : 'Cancelado'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleViewDetails(exp.id, 'despesa')}
                                style={{ padding: '4px 10px', fontSize: '11.5px', fontWeight: 600, color: '#1E3280', border: '1.5px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                Visualizar
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {latestExpenses.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF' }}>Nenhuma despesa cadastrada no período.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ─── TAB: USUÁRIOS ─── */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', animation: 'cebsFadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Gestão de Usuários</h3>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px' }}>Controle de operadores e níveis de acesso do CEBS Financeiro</p>
                </div>
                <button
                  onClick={() => addToast('info', 'Acesso Restrito', 'Apenas a Direção Geral pode convidar novos membros neste MVP.')}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #1E3280', backgroundColor: '#1E3280', color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 1px 3px rgba(30,50,128,0.25)' }}
                >
                  Convidar Membro
                </button>
              </div>

              <div className="cebs-card" style={{ padding: '0px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #F3F4F6', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#FAFBFD' }}>
                      <th style={{ padding: '12px 20px' }}>Nome</th>
                      <th style={{ padding: '12px 20px' }}>Email</th>
                      <th style={{ padding: '12px 20px' }}>Cargo / Função</th>
                      <th style={{ padding: '12px 20px' }}>Nível de Acesso</th>
                      <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    {[
                      { name: 'Maria Souza', email: 'diretoria@cebs.edu.br', role: 'Diretora Geral', access: 'Administrador', status: 'Ativo' },
                      { name: 'Pedro Santos', email: 'pedro.financeiro@cebs.edu.br', role: 'Secretário Executivo', access: 'Operador', status: 'Ativo' },
                      { name: 'Joana Lima', email: 'joana.auxiliar@cebs.edu.br', role: 'Auxiliar Financeira', access: 'Visualizador', status: 'Ativo' },
                    ].map((usr, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111827' }}>{usr.name}</td>
                        <td style={{ padding: '14px 20px', color: '#6B7280' }}>{usr.email}</td>
                        <td style={{ padding: '14px 20px' }}>{usr.role}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 650, color: usr.access === 'Administrador' ? '#1E3280' : '#4B5563', backgroundColor: usr.access === 'Administrador' ? '#EAF2FF' : '#F3F4F6' }}>
                            {usr.access}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '10.5px', fontWeight: 700, color: '#2E7D57', backgroundColor: '#EAF5F0' }}>
                            {usr.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TAB: CONFIGURAÇÕES ─── */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', animation: 'cebsFadeIn 0.2s ease' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Configurações Institucionais</h3>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px' }}>Gerencie as preferências e informações do Centro Educacional Batista Sobrinho</p>
              </div>

              <div className="cebs-card" style={{ padding: '28px' }}>
                <form onSubmit={(e) => { e.preventDefault(); addToast('success', 'Configurações Salvas', 'As preferências foram salvas com sucesso.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  
                  {/* Grid fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome da Escola</label>
                      <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required className="walltravel-input" style={{ fontSize: '13px', padding: '9px 12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome Fantasia</label>
                      <input type="text" value={schoolNickName} onChange={(e) => setSchoolNickName(e.target.value)} required className="walltravel-input" style={{ fontSize: '13px', padding: '9px 12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documento (CNPJ/INEP)</label>
                      <input type="text" value={schoolDocument} onChange={(e) => setSchoolDocument(e.target.value)} className="walltravel-input" style={{ fontSize: '13px', padding: '9px 12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telefone</label>
                      <input type="text" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} className="walltravel-input" style={{ fontSize: '13px', padding: '9px 12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail de Contato</label>
                      <input type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} required className="walltravel-input" style={{ fontSize: '13px', padding: '9px 12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Centros de Custo (Separados por vírgula)</label>
                      <input type="text" value={schoolCostCenters} onChange={(e) => setSchoolCostCenters(e.target.value)} className="walltravel-input" style={{ fontSize: '13px', padding: '9px 12px' }} />
                      <p style={{ fontSize: '10.5px', color: '#9CA3AF', marginTop: '1px' }}>Essas opções serão disponibilizadas para classificação no lançamento de despesas.</p>
                    </div>
                  </div>

                  {/* Section preferences */}
                  <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '6px 0' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferências Gerais</h4>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#4B5563', cursor: 'pointer' }}>
                      <input type="checkbox" checked={schoolPrefAlerts} onChange={(e) => setSchoolPrefAlerts(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#1E3280' }} />
                      Ativar cálculo automático de despesas atrasadas no runtime
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#4B5563', cursor: 'pointer' }}>
                      <input type="checkbox" checked={schoolPrefCloseLock} onChange={(e) => setSchoolPrefCloseLock(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#1E3280' }} />
                      Bloquear qualquer edição/exclusão de despesas quando o mês estiver fechado
                    </label>
                  </div>

                  {/* Submit row */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="submit" style={{ padding: '8px 24px', borderRadius: '7px', border: '1.5px solid #1E3280', backgroundColor: '#1E3280', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(30,50,128,0.25)' }}>
                      Salvar Alterações
                    </button>
                  </div>
                </form>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', padding: '16px 18px', backgroundColor: '#fff', borderRadius: '10px', border: '1.5px solid #E5E7EB' }}>
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
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fornecedor</span>
                    <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="walltravel-input" style={{ padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit' }}>
                      <option value="all">Todos os Fornecedores</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
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

          {/* ─── TAB: FORNECEDORES ─── */}
          {activeTab === 'suppliers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>Cadastro e Gestão de Fornecedores</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    Gerencie fornecedores, CNPJ/CPF, contatos e acompanhe despesas vinculadas.
                  </p>
                </div>
                <button
                  onClick={() => setIsSupplierManagerOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #1E3280',
                    backgroundColor: '#1E3280',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle style={{ width: '15px', height: '15px' }} />
                  Gerenciar Fornecedores
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                {suppliers.map(sup => {
                  const linkedExpenses = expenses.filter(e => e.supplierId === sup.id || e.supplier.toLowerCase() === sup.name.toLowerCase());
                  const totalSpent = linkedExpenses.filter(e => e.status !== 'cancelado').reduce((sum, e) => sum + e.amount, 0);

                  return (
                    <div key={sup.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs text-left">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm md:text-base">{sup.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {sup.documentNumber ? `CNPJ/CPF: ${sup.documentNumber}` : 'Sem documento registrado'}
                          </span>
                        </div>
                        {!sup.isActive && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-500">Inativo</span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-semibold">
                        {sup.phone && <div>📞 {sup.phone}</div>}
                        {sup.email && <div>✉️ {sup.email}</div>}
                        <div className="text-slate-900 font-bold pt-1">
                          Despesas vinculadas: {linkedExpenses.length} ({totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                        </div>
                      </div>
                    </div>
                  );
                })}

                {suppliers.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">
                    Nenhum fornecedor cadastrado até o momento.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: RELATÓRIOS ─── */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Relatórios</h3>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px' }}>Resumo financeiro do período atual</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #1E3280', backgroundColor: '#fff', color: '#1E3280', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  <FileSpreadsheet style={{ width: '13px', height: '13px' }} />
                  Exportar CSV
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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

                {/* Por fornecedor */}
                <div className="walltravel-panel" style={{ padding: '22px 24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '14px' }}>Por Fornecedor</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {suppliers.map(sup => {
                      const supTotal = processedExpenses.filter(e => (e.supplierId === sup.id || e.supplier.toLowerCase() === sup.name.toLowerCase()) && e.status !== 'cancelado').reduce((s, e) => s + e.amount, 0);
                      if (supTotal === 0) return null;
                      return (
                        <div key={sup.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>{sup.name}</span>
                          <CurrencyValue value={-supTotal} colorType="neutral" size="sm" />
                        </div>
                      );
                    })}
                    {suppliers.every(s => processedExpenses.filter(e => (e.supplierId === s.id || e.supplier.toLowerCase() === s.name.toLowerCase()) && e.status !== 'cancelado').reduce((sum, e) => sum + e.amount, 0) === 0) && (
                      <p style={{ fontSize: '12px', color: '#D1D5DB', textAlign: 'center', padding: '8px 0' }}>Nenhum fornecedor vinculado</p>
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
      <ExpenseFormModal isOpen={isExpenseFormOpen} onClose={() => setIsExpenseFormOpen(false)} onSubmit={handleSaveExpense} categories={categories} suppliers={suppliers} editingExpense={editingTransaction} onAddCategoryInline={handleAddCategoryInline} onAddSupplierInline={handleAddSupplierInline} />
      <IncomeFormModal isOpen={isIncomeFormOpen} onClose={() => setIsIncomeFormOpen(false)} onSubmit={handleSaveIncome} categories={categories} editingIncome={editingTransaction} onAddCategoryInline={handleAddCategoryInline} />
      <CategoryManagerModal isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} categories={categories} expenses={expenses} incomes={incomes} onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} />
      <SupplierManagerModal isOpen={isSupplierManagerOpen} onClose={() => setIsSupplierManagerOpen(false)} suppliers={suppliers} expenses={expenses} onAddSupplier={handleAddSupplier} onUpdateSupplier={handleUpdateSupplier} onDeleteSupplier={handleDeleteSupplier} />
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
