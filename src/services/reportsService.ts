import { listExpenses } from './expensesService';
import { listCategories } from './categoriesService';
import { listSuppliers } from './suppliersService';
import { Expense, TransactionStatus, Category, Supplier } from '@/types/financial';

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  supplierId?: string;
  supplierName?: string;
  status?: string;
  costCenter?: string;
  paymentMethod?: string;
  expenseType?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface ReportKPIs {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  countTotal: number;
  averageAmount: number;
  highestExpense?: Expense;
  topCategoryName: string;
  topSupplierName: string;
}

export interface CategoryReportItem {
  categoryId: string;
  categoryName: string;
  color: string;
  count: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmount: number;
  percentage: number;
}

export interface SupplierReportItem {
  supplierId?: string;
  supplierName: string;
  count: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmount: number;
  percentage: number;
  lastExpenseDate: string;
}

export interface StatusReportItem {
  status: TransactionStatus;
  label: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface MonthlyReportItem {
  monthKey: string;
  monthLabel: string;
  count: number;
  totalExpenses: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface PayablesReportItem {
  expense: Expense;
  daysDiff: number;
  isOverdue: boolean;
}

export interface PaymentMethodReportItem {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface CostCenterReportItem {
  costCenterName: string;
  count: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmount: number;
  percentage: number;
}

// 1. Filtrar lista de despesas com base em critérios avançados
export const getFilteredExpenses = (allExpenses: Expense[], filters: ReportFilterOptions): Expense[] => {
  return allExpenses.filter(e => {
    if (filters.startDate && e.dueDate < filters.startDate) return false;
    if (filters.endDate && e.dueDate > filters.endDate) return false;
    if (filters.categoryId && filters.categoryId !== 'all' && e.categoryId !== filters.categoryId) return false;
    if (filters.supplierId && filters.supplierId !== 'all' && e.supplierId !== filters.supplierId) return false;
    if (filters.supplierName && filters.supplierName !== 'all' && (e.supplier || '').toLowerCase() !== filters.supplierName.toLowerCase()) return false;
    if (filters.status && filters.status !== 'all' && e.status !== filters.status) return false;
    if (filters.paymentMethod && filters.paymentMethod !== 'all' && e.paymentMethod !== filters.paymentMethod) return false;
    if (filters.expenseType && filters.expenseType !== 'all' && e.type !== filters.expenseType) return false;
    if (filters.costCenter && filters.costCenter.trim() && !(e.costCenter || '').toLowerCase().includes(filters.costCenter.toLowerCase())) return false;
    if (filters.minAmount !== undefined && !isNaN(filters.minAmount) && e.amount < filters.minAmount) return false;
    if (filters.maxAmount !== undefined && !isNaN(filters.maxAmount) && e.amount > filters.maxAmount) return false;
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchSup = (e.supplier || '').toLowerCase().includes(q);
      const matchNotes = (e.notes || '').toLowerCase().includes(q);
      const matchCC = (e.costCenter || '').toLowerCase().includes(q);
      if (!matchDesc && !matchSup && !matchNotes && !matchCC) return false;
    }
    return true;
  });
};

// 2. Método principal para buscar despesas filtradas direto dos dados carregados
export const getDetailedReport = async (filters: ReportFilterOptions): Promise<Expense[]> => {
  const allExpenses = await listExpenses();
  return getFilteredExpenses(allExpenses, filters);
};

// 3. Calcular KPIs do período selecionado
export const calculateReportKPIs = (expenses: Expense[], categories: Category[], suppliers: Supplier[]): ReportKPIs => {
  const active = expenses.filter(e => e.status !== 'cancelado');
  const countTotal = active.length;

  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let highestExpense: Expense | undefined = undefined;

  const categoryTotals = new Map<string, number>();
  const supplierTotals = new Map<string, number>();

  active.forEach(e => {
    totalAmount += e.amount;

    if (e.status === 'pago') totalPaid += e.amount;
    else if (e.status === 'pendente') totalPending += e.amount;
    else if (e.status === 'atrasado') totalOverdue += e.amount;

    if (!highestExpense || e.amount > highestExpense.amount) {
      highestExpense = e;
    }

    const catName = categories.find(c => c.id === e.categoryId)?.name || 'Sem categoria';
    categoryTotals.set(catName, (categoryTotals.get(catName) || 0) + e.amount);

    const supName = e.supplier?.trim() || 'Sem fornecedor';
    supplierTotals.set(supName, (supplierTotals.get(supName) || 0) + e.amount);
  });

  const averageAmount = countTotal > 0 ? totalAmount / countTotal : 0;

  let topCategoryName = 'Nenhuma';
  let maxCatAmount = 0;
  categoryTotals.forEach((amt, name) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategoryName = name;
    }
  });

  let topSupplierName = 'Nenhum';
  let maxSupAmount = 0;
  supplierTotals.forEach((amt, name) => {
    if (amt > maxSupAmount) {
      maxSupAmount = amt;
      topSupplierName = name;
    }
  });

  return {
    totalAmount,
    totalPaid,
    totalPending,
    totalOverdue,
    countTotal,
    averageAmount,
    highestExpense,
    topCategoryName,
    topSupplierName,
  };
};

// 4. Relatório por Categoria
export const getCategoryReport = (expenses: Expense[], categories: Category[]): CategoryReportItem[] => {
  const active = expenses.filter(e => e.status !== 'cancelado');
  const grandTotal = active.reduce((sum, e) => sum + e.amount, 0);

  const catMap = new Map<string, { categoryId: string; categoryName: string; color: string; count: number; totalPaid: number; totalPending: number; totalOverdue: number; totalAmount: number }>();

  // Initialize with active expense categories
  categories.filter(c => c.type === 'despesa').forEach(c => {
    catMap.set(c.id, {
      categoryId: c.id,
      categoryName: c.name,
      color: c.color || 'blue',
      count: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalAmount: 0,
    });
  });

  active.forEach(e => {
    let cat = catMap.get(e.categoryId);
    if (!cat) {
      const matchCat = categories.find(c => c.id === e.categoryId);
      cat = {
        categoryId: e.categoryId || 'uncategorized',
        categoryName: matchCat?.name || 'Sem categoria',
        color: matchCat?.color || 'slate',
        count: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalAmount: 0,
      };
      catMap.set(cat.categoryId, cat);
    }

    cat.count += 1;
    cat.totalAmount += e.amount;
    if (e.status === 'pago') cat.totalPaid += e.amount;
    else if (e.status === 'pendente') cat.totalPending += e.amount;
    else if (e.status === 'atrasado') cat.totalOverdue += e.amount;
  });

  const result: CategoryReportItem[] = [];
  catMap.forEach(item => {
    if (item.count > 0) {
      result.push({
        ...item,
        percentage: grandTotal > 0 ? (item.totalAmount / grandTotal) * 100 : 0
      });
    }
  });

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
};

// 5. Relatório por Fornecedor
export const getSupplierReport = (expenses: Expense[]): SupplierReportItem[] => {
  const active = expenses.filter(e => e.status !== 'cancelado');
  const grandTotal = active.reduce((sum, e) => sum + e.amount, 0);

  const supMap = new Map<string, SupplierReportItem>();

  active.forEach(e => {
    const name = e.supplier?.trim() || 'Sem fornecedor';
    let item = supMap.get(name);
    if (!item) {
      item = {
        supplierId: e.supplierId,
        supplierName: name,
        count: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalAmount: 0,
        percentage: 0,
        lastExpenseDate: e.dueDate,
      };
      supMap.set(name, item);
    }

    item.count += 1;
    item.totalAmount += e.amount;
    if (e.status === 'pago') item.totalPaid += e.amount;
    else if (e.status === 'pendente') item.totalPending += e.amount;
    else if (e.status === 'atrasado') item.totalOverdue += e.amount;

    if (!item.lastExpenseDate || e.dueDate > item.lastExpenseDate) {
      item.lastExpenseDate = e.dueDate;
    }
  });

  const result: SupplierReportItem[] = [];
  supMap.forEach(item => {
    result.push({
      ...item,
      percentage: grandTotal > 0 ? (item.totalAmount / grandTotal) * 100 : 0
    });
  });

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
};

// 6. Relatório por Status
export const getStatusReport = (expenses: Expense[]): StatusReportItem[] => {
  const totalCount = expenses.length;
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  const statusConfigs: { status: TransactionStatus; label: string }[] = [
    { status: 'pago', label: 'Pagas' },
    { status: 'pendente', label: 'Pendentes' },
    { status: 'atrasado', label: 'Vencidas' },
    { status: 'cancelado', label: 'Canceladas' },
  ];

  return statusConfigs.map(cfg => {
    const matched = expenses.filter(e => e.status === cfg.status);
    const count = matched.length;
    const totalAmount = matched.reduce((sum, e) => sum + e.amount, 0);
    const percentage = grandTotal > 0 ? (totalAmount / grandTotal) * 100 : 0;

    return {
      status: cfg.status,
      label: cfg.label,
      count,
      totalAmount,
      percentage
    };
  });
};

// 7. Relatório Mensal
export const getMonthlyReport = (expenses: Expense[]): MonthlyReportItem[] => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const map = new Map<string, MonthlyReportItem>();

  expenses.forEach(e => {
    if (!e.dueDate) return;
    const yearMonth = e.dueDate.slice(0, 7); // YYYY-MM
    const [yyyy, mm] = yearMonth.split('-');
    const mIdx = parseInt(mm, 10) - 1;
    const monthLabel = `${monthNames[mIdx] || mm}/${yyyy}`;

    let item = map.get(yearMonth);
    if (!item) {
      item = {
        monthKey: yearMonth,
        monthLabel,
        count: 0,
        totalExpenses: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
      };
      map.set(yearMonth, item);
    }

    item.count += 1;
    if (e.status !== 'cancelado') {
      item.totalExpenses += e.amount;
      if (e.status === 'pago') item.totalPaid += e.amount;
      else if (e.status === 'pendente') item.totalPending += e.amount;
      else if (e.status === 'atrasado') item.totalOverdue += e.amount;
    }
  });

  const result = Array.from(map.values());
  return result.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};

// 8. Relatório de Contas a Pagar / Pagas / Vencidas
export const getPayablesReport = (expenses: Expense[], filterType: 'all_payables' | 'paid_only' | 'overdue_only'): PayablesReportItem[] => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTime = new Date(todayStr).getTime();

  let filtered = expenses.filter(e => e.status !== 'cancelado');
  if (filterType === 'all_payables') {
    filtered = filtered.filter(e => e.status === 'pendente' || e.status === 'atrasado');
  } else if (filterType === 'paid_only') {
    filtered = filtered.filter(e => e.status === 'pago');
  } else if (filterType === 'overdue_only') {
    filtered = filtered.filter(e => e.status === 'atrasado');
  }

  return filtered.map(e => {
    const dueTime = new Date(e.dueDate).getTime();
    const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));
    return {
      expense: e,
      daysDiff: diffDays,
      isOverdue: e.status === 'atrasado' || (e.status === 'pendente' && diffDays < 0)
    };
  }).sort((a, b) => a.expense.dueDate.localeCompare(b.expense.dueDate));
};

// 9. Relatório por Forma de Pagamento
export const getPaymentMethodReport = (expenses: Expense[]): PaymentMethodReportItem[] => {
  const active = expenses.filter(e => e.status !== 'cancelado');
  const grandTotal = active.reduce((sum, e) => sum + e.amount, 0);

  const methodMap = new Map<string, { count: number; totalAmount: number }>();

  active.forEach(e => {
    const method = e.paymentMethod?.trim() || 'Não especificada';
    const current = methodMap.get(method) || { count: 0, totalAmount: 0 };
    current.count += 1;
    current.totalAmount += e.amount;
    methodMap.set(method, current);
  });

  const result: PaymentMethodReportItem[] = [];
  methodMap.forEach((val, method) => {
    result.push({
      method,
      count: val.count,
      totalAmount: val.totalAmount,
      percentage: grandTotal > 0 ? (val.totalAmount / grandTotal) * 100 : 0
    });
  });

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
};

// 10. Relatório por Centro de Custo
export const getCostCenterReport = (expenses: Expense[]): CostCenterReportItem[] => {
  const active = expenses.filter(e => e.status !== 'cancelado');
  const grandTotal = active.reduce((sum, e) => sum + e.amount, 0);

  const ccMap = new Map<string, CostCenterReportItem>();

  active.forEach(e => {
    const ccName = e.costCenter?.trim() || 'Sem centro de custo';
    let item = ccMap.get(ccName);
    if (!item) {
      item = {
        costCenterName: ccName,
        count: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalAmount: 0,
        percentage: 0
      };
      ccMap.set(ccName, item);
    }

    item.count += 1;
    item.totalAmount += e.amount;
    if (e.status === 'pago') item.totalPaid += e.amount;
    else if (e.status === 'pendente') item.totalPending += e.amount;
    else if (e.status === 'atrasado') item.totalOverdue += e.amount;
  });

  const result: CostCenterReportItem[] = [];
  ccMap.forEach(item => {
    result.push({
      ...item,
      percentage: grandTotal > 0 ? (item.totalAmount / grandTotal) * 100 : 0
    });
  });

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
};
