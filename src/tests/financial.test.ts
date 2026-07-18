import { describe, test, expect } from 'vitest';
import { Category, Expense, Income, TransactionStatus } from '../types/financial';

// Helper logic mimicking page.tsx state transitions
const isDuplicateCategory = (name: string, categories: Category[]) => {
  return categories.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
};

const canDeleteCategory = (catId: string, expenses: Expense[], incomes: Income[]) => {
  const hasExpense = expenses.some(e => e.categoryId === catId);
  const hasIncome = incomes.some(i => i.categoryId === catId);
  return !hasExpense && !hasIncome;
};

const getRuntimeStatus = (exp: Expense, currentDateStr: string): TransactionStatus => {
  if (exp.status === 'pendente') {
    if (exp.dueDate < currentDateStr) {
      return 'atrasado';
    }
  }
  return exp.status;
};

const filterExpenses = (
  expenses: Expense[],
  categories: Category[],
  filters: {
    selectedCategoryName?: string | null;
    quickFilter?: 'all' | 'payables';
    searchQuery?: string;
    statusFilter?: 'all' | TransactionStatus;
    paymentMethodFilter?: string;
    costCenterFilter?: string;
    minAmountFilter?: string;
    maxAmountFilter?: string;
    currentDate: string;
  }
) => {
  return expenses.filter(e => {
    // 1. Category Filter
    if (filters.selectedCategoryName) {
      const cat = categories.find(c => c.id === e.categoryId);
      if (!cat || cat.name !== filters.selectedCategoryName) return false;
    }
    // 2. Quick Filter (Contas a pagar)
    const runtimeStatus = getRuntimeStatus(e, filters.currentDate);
    if (filters.quickFilter === 'payables') {
      if (runtimeStatus !== 'pendente' && runtimeStatus !== 'atrasado') return false;
    }
    // 3. Search query
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const descMatch = e.description.toLowerCase().includes(q);
      const supplierMatch = e.supplier.toLowerCase().includes(q);
      if (!descMatch && !supplierMatch) return false;
    }
    // 4. Status
    if (filters.statusFilter && filters.statusFilter !== 'all' && runtimeStatus !== filters.statusFilter) return false;
    // 5. Payment method
    if (filters.paymentMethodFilter && filters.paymentMethodFilter !== 'all' && e.paymentMethod !== filters.paymentMethodFilter) return false;
    // 6. Cost center
    if (filters.costCenterFilter?.trim() && (!e.costCenter || !e.costCenter.toLowerCase().includes(filters.costCenterFilter.toLowerCase()))) return false;
    // 7. Min Amount
    if (filters.minAmountFilter && e.amount < parseFloat(filters.minAmountFilter)) return false;
    // 8. Max Amount
    if (filters.maxAmountFilter && e.amount > parseFloat(filters.maxAmountFilter)) return false;

    return true;
  });
};

// Form Validation Mock logic
const validateExpense = (exp: {
  description: string;
  categoryId: string;
  amount: string;
  dueDate: string;
  status: TransactionStatus;
  paymentDate?: string;
  paymentMethod?: string;
}) => {
  if (!exp.description.trim()) return 'Descrição obrigatória';
  if (!exp.categoryId) return 'Categoria obrigatória';
  if (!exp.amount || parseFloat(exp.amount) <= 0) return 'Valor deve ser maior que zero';
  if (!exp.dueDate) return 'Vencimento obrigatório';
  if (exp.status === 'pago' && !exp.paymentDate) return 'Data de pagamento obrigatória';
  if (exp.status === 'pago' && !exp.paymentMethod) return 'Forma de pagamento obrigatória';
  return null;
};

// -------------------------------------------------------------
// TEST SUITE
// -------------------------------------------------------------

describe('School Financial System Logic Tests (Fase 4)', () => {
  // Mock baseline data
  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Salários', type: 'despesa', active: true, color: 'blue', icon: 'User' },
    { id: 'cat-2', name: 'Energia', type: 'despesa', active: true, color: 'yellow', icon: 'Zap' },
    { id: 'cat-3', name: 'Internet', type: 'despesa', active: false, color: 'indigo', icon: 'Wifi' },
  ];

  const mockExpenses: Expense[] = [
    {
      id: 'exp-1',
      categoryId: 'cat-2',
      description: 'Energia elétrica',
      supplier: 'Enel',
      amount: 350.00,
      dueDate: '2026-07-20',
      status: 'pendente',
      type: 'fixa',
      createdAt: '2026-07-04',
      updatedAt: '2026-07-04',
      costCenter: 'Administração',
    },
    {
      id: 'exp-2',
      categoryId: 'cat-1',
      description: 'Salário Professora Ana',
      supplier: 'Ana Silva',
      amount: 2500.00,
      dueDate: '2026-07-05',
      status: 'pago',
      paymentDate: '2026-07-05',
      paymentMethod: 'PIX',
      type: 'fixa',
      createdAt: '2026-07-04',
      updatedAt: '2026-07-04',
      costCenter: 'Pedagógico',
    }
  ];

  const mockIncomes: Income[] = [];

  // 1. Category tests
  test('Category duplication check (case-insensitive)', () => {
    expect(isDuplicateCategory('salários', mockCategories)).toBe(true);
    expect(isDuplicateCategory('SALÁRIOS  ', mockCategories)).toBe(true);
    expect(isDuplicateCategory('Aluguel', mockCategories)).toBe(false);
  });

  test('Block deleting category linked to expenses', () => {
    expect(canDeleteCategory('cat-2', mockExpenses, mockIncomes)).toBe(false); // linked to Energia elétrica
    expect(canDeleteCategory('cat-3', mockExpenses, mockIncomes)).toBe(true); // not linked
  });

  // 2. Expense validation tests
  test('Expense required fields validation', () => {
    expect(validateExpense({
      description: '',
      categoryId: 'cat-1',
      amount: '100',
      dueDate: '2026-07-10',
      status: 'pendente'
    })).toBe('Descrição obrigatória');

    expect(validateExpense({
      description: 'Internet mensal',
      categoryId: '',
      amount: '100',
      dueDate: '2026-07-10',
      status: 'pendente'
    })).toBe('Categoria obrigatória');

    expect(validateExpense({
      description: 'Internet mensal',
      categoryId: 'cat-1',
      amount: '0',
      dueDate: '2026-07-10',
      status: 'pendente'
    })).toBe('Valor deve ser maior que zero');

    expect(validateExpense({
      description: 'Internet mensal',
      categoryId: 'cat-1',
      amount: '-5',
      dueDate: '2026-07-10',
      status: 'pendente'
    })).toBe('Valor deve ser maior que zero');

    expect(validateExpense({
      description: 'Internet mensal',
      categoryId: 'cat-1',
      amount: '120.00',
      dueDate: '',
      status: 'pendente'
    })).toBe('Vencimento obrigatório');
  });

  test('Payment details mandatory when status is paid', () => {
    expect(validateExpense({
      description: 'Serviço TI',
      categoryId: 'cat-1',
      amount: '500.00',
      dueDate: '2026-07-10',
      status: 'pago',
      paymentDate: '',
      paymentMethod: 'PIX'
    })).toBe('Data de pagamento obrigatória');

    expect(validateExpense({
      description: 'Serviço TI',
      categoryId: 'cat-1',
      amount: '500.00',
      dueDate: '2026-07-10',
      status: 'pago',
      paymentDate: '2026-07-10',
      paymentMethod: ''
    })).toBe('Forma de pagamento obrigatória');

    expect(validateExpense({
      description: 'Serviço TI',
      categoryId: 'cat-1',
      amount: '500.00',
      dueDate: '2026-07-10',
      status: 'pago',
      paymentDate: '2026-07-10',
      paymentMethod: 'PIX'
    })).toBeNull();
  });

  // 3. Status Rules tests
  test('Pending past due date resolves to overdue runtime status', () => {
    const overdueExp: Expense = {
      ...mockExpenses[0],
      dueDate: '2026-07-01', // prior to simulation date
    };
    expect(getRuntimeStatus(overdueExp, '2026-07-04')).toBe('atrasado');

    const inTimeExp: Expense = {
      ...mockExpenses[0],
      dueDate: '2026-07-10', // after simulation date
    };
    expect(getRuntimeStatus(inTimeExp, '2026-07-04')).toBe('pendente');
  });

  // 4. Advanced Filters tests
  test('Filters: Text search on description and supplier', () => {
    const res1 = filterExpenses(mockExpenses, mockCategories, { searchQuery: 'energia', currentDate: '2026-07-04' });
    expect(res1).toHaveLength(1);
    expect(res1[0].id).toBe('exp-1');

    const res2 = filterExpenses(mockExpenses, mockCategories, { searchQuery: 'Ana', currentDate: '2026-07-04' });
    expect(res2).toHaveLength(1);
    expect(res2[0].id).toBe('exp-2');
  });

  test('Filters: Status filtering (overdue vs paid)', () => {
    const overdueExp: Expense = {
      ...mockExpenses[0],
      dueDate: '2026-07-01', // overdue
    };
    const list = [overdueExp, mockExpenses[1]];

    const resOverdue = filterExpenses(list, mockCategories, { statusFilter: 'atrasado', currentDate: '2026-07-04' });
    expect(resOverdue).toHaveLength(1);
    expect(resOverdue[0].id).toBe('exp-1');

    const resPaid = filterExpenses(list, mockCategories, { statusFilter: 'pago', currentDate: '2026-07-04' });
    expect(resPaid).toHaveLength(1);
    expect(resPaid[0].id).toBe('exp-2');
  });

  test('Filters: Cost Center filtering', () => {
    const resPedagogico = filterExpenses(mockExpenses, mockCategories, { costCenterFilter: 'pedagógico', currentDate: '2026-07-04' });
    expect(resPedagogico).toHaveLength(1);
    expect(resPedagogico[0].id).toBe('exp-2');
  });

  test('Filters: Value Range filtering', () => {
    const resRange = filterExpenses(mockExpenses, mockCategories, {
      minAmountFilter: '400',
      maxAmountFilter: '3000',
      currentDate: '2026-07-04'
    });
    expect(resRange).toHaveLength(1);
    expect(resRange[0].id).toBe('exp-2');
  });
});
