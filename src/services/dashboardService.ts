import { listExpenses } from './expensesService';
import { listIncomes } from './incomesService';
import { listCategories } from './categoriesService';
import { Expense, Income } from '@/types/financial';

export interface DashboardSummary {
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  overdueExpenses: number;
  countExpenses: number;
  grossRevenue: number;
  countIncomes: number;
}

export const getDashboardSummary = async (expensesList?: Expense[], incomesList?: Income[]): Promise<DashboardSummary> => {
  const expenses = expensesList ?? (await listExpenses());
  const incomes = incomesList ?? (await listIncomes());

  const activeExpenses = expenses.filter(e => e.status !== 'cancelado');

  const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = activeExpenses.filter(e => e.status === 'pago').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = activeExpenses.filter(e => e.status === 'pendente').reduce((sum, e) => sum + e.amount, 0);
  const overdueExpenses = activeExpenses.filter(e => e.status === 'atrasado').reduce((sum, e) => sum + e.amount, 0);
  const grossRevenue = incomes.reduce((sum, i) => sum + i.amount, 0);

  return {
    totalExpenses,
    paidExpenses,
    pendingExpenses,
    overdueExpenses,
    countExpenses: activeExpenses.length,
    grossRevenue,
    countIncomes: incomes.length
  };
};

export const getExpensesByCategorySummary = async (expensesList?: Expense[]) => {
  const expenses = expensesList ?? (await listExpenses());
  const categories = await listCategories();
  const activeExpenses = expenses.filter(e => e.status !== 'cancelado');
  const total = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  return categories
    .filter(c => c.type === 'despesa')
    .map(cat => {
      const amount = activeExpenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return {
        category: cat,
        amount,
        percentage
      };
    })
    .filter(item => item.amount > 0);
};

export const getMonthlyEvolution = async (expensesList?: Expense[]) => {
  const expenses = expensesList ?? (await listExpenses());
  const activeExpenses = expenses.filter(e => e.status !== 'cancelado');

  // Months label calculation for the past 6 months
  const now = new Date();
  const months: { yearMonth: string; label: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    months.push({ yearMonth, label: label.charAt(0).toUpperCase() + label.slice(1), value: 0 });
  }

  activeExpenses.forEach(exp => {
    if (exp.dueDate) {
      const ym = exp.dueDate.slice(0, 7);
      const target = months.find(m => m.yearMonth === ym);
      if (target) {
        target.value += exp.amount;
      }
    }
  });

  return months;
};
