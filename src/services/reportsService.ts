import { listExpenses } from './expensesService';
import { Expense } from '@/types/financial';

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  supplierId?: string;
  supplierName?: string;
  status?: string;
  costCenter?: string;
  paymentMethod?: string;
}

export interface SupplierReportItem {
  supplierId?: string;
  supplierName: string;
  count: number;
  totalAmount: number;
  percentage: number;
  lastExpenseDate: string;
}

export const getDetailedReport = async (filters: ReportFilterOptions): Promise<Expense[]> => {
  const allExpenses = await listExpenses();

  return allExpenses.filter(e => {
    if (filters.startDate && e.dueDate < filters.startDate) return false;
    if (filters.endDate && e.dueDate > filters.endDate) return false;
    if (filters.categoryId && filters.categoryId !== 'all' && e.categoryId !== filters.categoryId) return false;
    if (filters.supplierId && filters.supplierId !== 'all' && e.supplierId !== filters.supplierId) return false;
    if (filters.supplierName && filters.supplierName !== 'all' && e.supplier.toLowerCase() !== filters.supplierName.toLowerCase()) return false;
    if (filters.status && filters.status !== 'all' && e.status !== filters.status) return false;
    if (filters.paymentMethod && filters.paymentMethod !== 'all' && e.paymentMethod !== filters.paymentMethod) return false;
    if (filters.costCenter && filters.costCenter.trim() && !e.costCenter?.toLowerCase().includes(filters.costCenter.toLowerCase())) return false;
    return true;
  });
};

export const getSupplierReport = async (filters: ReportFilterOptions): Promise<SupplierReportItem[]> => {
  const filtered = await getDetailedReport(filters);
  const activeExpenses = filtered.filter(e => e.status !== 'cancelado');
  const grandTotal = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const supplierMap = new Map<string, { count: number; totalAmount: number; lastDate: string }>();

  activeExpenses.forEach(e => {
    const name = e.supplier?.trim() || 'Sem fornecedor';
    const current = supplierMap.get(name) || { count: 0, totalAmount: 0, lastDate: '' };
    current.count += 1;
    current.totalAmount += e.amount;
    if (!current.lastDate || e.dueDate > current.lastDate) {
      current.lastDate = e.dueDate;
    }
    supplierMap.set(name, current);
  });

  const result: SupplierReportItem[] = [];
  supplierMap.forEach((val, name) => {
    result.push({
      supplierName: name,
      count: val.count,
      totalAmount: val.totalAmount,
      percentage: grandTotal > 0 ? (val.totalAmount / grandTotal) * 100 : 0,
      lastExpenseDate: val.lastDate,
    });
  });

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
};

export const exportExpensesToCSV = (expenses: Expense[], categoriesMap: Map<string, string>): string => {
  const headers = ['Descrição', 'Categoria', 'Fornecedor', 'Vencimento', 'Valor (R$)', 'Status', 'Forma de Pagamento', 'Centro de Custo', 'Data Pagamento', 'Observações'];
  
  const rows = expenses.map(e => [
    e.description,
    categoriesMap.get(e.categoryId) || 'Outros',
    e.supplier || 'Sem fornecedor',
    e.dueDate ? e.dueDate.split('-').reverse().join('/') : '',
    e.amount.toFixed(2),
    e.status === 'pago' ? 'Pago' : e.status === 'pendente' ? 'Pendente' : e.status === 'atrasado' ? 'Vencido' : 'Cancelado',
    e.paymentMethod || '—',
    e.costCenter || '—',
    e.paymentDate ? e.paymentDate.split('-').reverse().join('/') : '—',
    e.notes || '—'
  ]);

  return [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
};
