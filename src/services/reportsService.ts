import { listExpenses } from './expensesService';
import { listCategories } from './categoriesService';
import { Expense } from '@/types/financial';

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  status?: string;
  costCenter?: string;
}

export const getDetailedReport = async (filters: ReportFilterOptions): Promise<Expense[]> => {
  const allExpenses = await listExpenses();

  return allExpenses.filter(e => {
    if (filters.startDate && e.dueDate < filters.startDate) return false;
    if (filters.endDate && e.dueDate > filters.endDate) return false;
    if (filters.categoryId && filters.categoryId !== 'all' && e.categoryId !== filters.categoryId) return false;
    if (filters.status && filters.status !== 'all' && e.status !== filters.status) return false;
    if (filters.costCenter && filters.costCenter.trim() && !e.costCenter?.toLowerCase().includes(filters.costCenter.toLowerCase())) return false;
    return true;
  });
};

export const exportExpensesToCSV = (expenses: Expense[], categoriesMap: Map<string, string>): string => {
  const headers = ['Descrição', 'Categoria', 'Vencimento', 'Valor (R$)', 'Status', 'Forma de Pagamento', 'Fornecedor', 'Centro de Custo', 'Data Pagamento', 'Observações'];
  
  const rows = expenses.map(e => [
    e.description,
    categoriesMap.get(e.categoryId) || 'Outros',
    e.dueDate ? e.dueDate.split('-').reverse().join('/') : '',
    e.amount.toFixed(2),
    e.status === 'pago' ? 'Pago' : e.status === 'pendente' ? 'Pendente' : e.status === 'atrasado' ? 'Vencido' : 'Cancelado',
    e.paymentMethod || '—',
    e.supplier || '—',
    e.costCenter || '—',
    e.paymentDate ? e.paymentDate.split('-').reverse().join('/') : '—',
    e.notes || '—'
  ]);

  return [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
};
