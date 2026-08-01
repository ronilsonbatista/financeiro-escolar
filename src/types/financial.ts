export type TransactionStatus = 'pago' | 'pendente' | 'atrasado' | 'cancelado';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'receita' | 'despesa';
  color: string; // Tailwind color name (e.g. 'indigo', 'amber')
  icon: string; // Lucide icon component name
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  documentNumber?: string; // CNPJ / CPF
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  description: string;
  categoryId: string; // foreign key to Category
  supplierId?: string; // foreign key to Supplier
  supplier: string; // text representation (for backwards compatibility)
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD
  paymentMethod?: string; // PIX, Cartão, Boleto, Dinheiro, Transferência, Débito automático, Outro
  status: TransactionStatus;
  type: 'fixa' | 'variavel' | 'recorrente' | 'extraordinaria';
  isRecurring: boolean;
  recurrenceFrequency?: string; // semanal, mensal, trimestral, anual
  costCenter?: string; // Centro de custo
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  description: string;
  source: string; // pagador/origem
  categoryId: string; // foreign key to Category
  amount: number;
  receivedDate: string; // YYYY-MM-DD (corresponds to paymentDate/dueDate)
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyClosing {
  id: string;
  month: number; // 1-12
  year: number;
  status: 'aberto' | 'fechado';
  closedAt?: string;
  reopenedAt?: string;
  totalIncome: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
  netResult: number;
  createdAt: string;
  updatedAt: string;
}
