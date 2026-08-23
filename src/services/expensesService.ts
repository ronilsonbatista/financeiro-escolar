import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Expense, TransactionStatus } from '@/types/financial';
import { listCostCenters } from './costCentersService';

const LOCAL_STORAGE_KEY = 'school_expenses_v3';

const isUUID = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
};

const getCostCenterId = async (input?: string): Promise<string | null> => {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();
  if (isUUID(trimmed)) return trimmed;

  try {
    const costCenters = await listCostCenters();
    const match = costCenters.find(cc => cc.id === trimmed || cc.name.toLowerCase() === trimmed.toLowerCase());
    if (match && isUUID(match.id)) {
      return match.id;
    }
  } catch (err) {
    console.warn('Erro ao resolver centro de custo:', err);
  }

  return null;
};

// Utility helper to map Supabase row to Expense object with runtime status calculation
export const mapDbRowToExpense = (row: any): Expense => {
  const rawStatus = String(row.status || 'pending');
  let status: TransactionStatus = 'pendente';

  // Runtime calculation for overdue pending expenses
  if (rawStatus === 'pending' || rawStatus === 'pendente') {
    const today = new Date().toISOString().slice(0, 10);
    if (row.due_date && row.due_date < today) {
      status = 'atrasado';
    } else {
      status = 'pendente';
    }
  } else if (rawStatus === 'paid' || rawStatus === 'pago') {
    status = 'pago';
  } else if (rawStatus === 'canceled' || rawStatus === 'cancelado') {
    status = 'cancelado';
  } else if (rawStatus === 'overdue' || rawStatus === 'atrasado') {
    status = 'atrasado';
  }

  const costCenterName =
    (row.cost_centers && typeof row.cost_centers === 'object' ? row.cost_centers.name : null) ||
    (row.cost_center && !isUUID(row.cost_center) ? row.cost_center : null) ||
    row.cost_center_id ||
    undefined;

  return {
    id: row.id,
    description: row.description,
    categoryId: row.category_id || '',
    supplierId: row.supplier_id || undefined,
    supplier: row.supplier || '',
    amount: Number(row.amount),
    dueDate: row.due_date,
    paymentDate: row.payment_date || undefined,
    paymentMethod: row.payment_method || undefined,
    status: status,
    type: row.type || 'variavel',
    isRecurring: Boolean(row.is_recurring),
    recurrenceFrequency: row.recurrence_frequency || undefined,
    costCenterId: row.cost_center_id || undefined,
    costCenter: costCenterName,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const listExpenses = async (): Promise<Expense[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, cost_centers(id, name)')
        .is('deleted_at', null)
        .order('due_date', { ascending: false });

      if (error) {
        // Fallback to select without join if relationship query fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('expenses')
          .select('*')
          .is('deleted_at', null)
          .order('due_date', { ascending: false });

        if (fallbackError) throw fallbackError;
        if (fallbackData) {
          return fallbackData.map(mapDbRowToExpense);
        }
      } else if (data) {
        return data.map(mapDbRowToExpense);
      }
    } catch (err) {
      console.warn('Erro ao listar despesas do Supabase, usando localStorage fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        const parsed: Expense[] = JSON.parse(local);
        const today = new Date().toISOString().slice(0, 10);
        return parsed.map(exp => {
          if (exp.status === 'pendente' && exp.dueDate < today) {
            return { ...exp, status: 'atrasado' as TransactionStatus };
          }
          return exp;
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  return [];
};

export const createExpense = async (expenseData: Partial<Expense>): Promise<{ data: Expense | null; error: string | null }> => {
  if (!expenseData.description?.trim()) {
    return { data: null, error: 'A descrição da despesa é obrigatória.' };
  }
  if (!expenseData.categoryId) {
    return { data: null, error: 'A categoria da despesa é obrigatória.' };
  }
  if (!expenseData.amount || expenseData.amount <= 0) {
    return { data: null, error: 'O valor da despesa deve ser maior que zero.' };
  }
  if (!expenseData.dueDate) {
    return { data: null, error: 'A data de vencimento é obrigatória.' };
  }

  const dbStatus = expenseData.status === 'pago' ? 'paid' : 'pending';

  if (isSupabaseConfigured()) {
    try {
      const costCenterId = await getCostCenterId(expenseData.costCenterId || expenseData.costCenter);

      const payload = {
        description: expenseData.description.trim(),
        category_id: expenseData.categoryId?.trim() || null,
        supplier_id: expenseData.supplierId?.trim() || null,
        supplier: expenseData.supplier?.trim() || null,
        cost_center_id: costCenterId,
        amount: expenseData.amount,
        due_date: expenseData.dueDate,
        payment_date: expenseData.paymentDate?.trim() || null,
        payment_method: expenseData.paymentMethod?.trim() || null,
        status: dbStatus,
        type: expenseData.type || 'variavel',
        is_recurring: Boolean(expenseData.isRecurring),
        recurrence_frequency: expenseData.recurrenceFrequency?.trim() || null,
        notes: expenseData.notes?.trim() || null
      };

      let insertedData: any = null;

      const { data, error } = await supabase
        .from('expenses')
        .insert([payload])
        .select('*, cost_centers(id, name)')
        .single();

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('expenses')
          .insert([payload])
          .select()
          .single();

        if (fallbackError) throw fallbackError;
        insertedData = fallbackData;
      } else {
        insertedData = data;
      }

      // Registrar Histórico
      await supabase.from('expense_history').insert([{
        expense_id: insertedData.id,
        action: 'created',
        new_data: payload
      }]);

      return { data: mapDbRowToExpense(insertedData), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao salvar despesa no Supabase.' };
    }
  }

  // Fallback Local Storage
  const existing = await listExpenses();
  const newExp: Expense = {
    id: `exp-${Date.now()}`,
    description: expenseData.description.trim(),
    categoryId: expenseData.categoryId,
    supplierId: expenseData.supplierId || undefined,
    supplier: expenseData.supplier?.trim() || '',
    amount: expenseData.amount,
    dueDate: expenseData.dueDate,
    paymentDate: expenseData.paymentDate || undefined,
    paymentMethod: expenseData.paymentMethod || undefined,
    status: (expenseData.status as TransactionStatus) || 'pendente',
    type: expenseData.type || 'variavel',
    isRecurring: Boolean(expenseData.isRecurring),
    recurrenceFrequency: expenseData.recurrenceFrequency || undefined,
    costCenter: expenseData.costCenter || undefined,
    costCenterId: expenseData.costCenterId || undefined,
    notes: expenseData.notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedList = [newExp, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  }
  return { data: newExp, error: null };
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<{ data: Expense | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.description !== undefined) payload.description = updates.description.trim();
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId.trim() || null;
      if (updates.supplierId !== undefined) payload.supplier_id = updates.supplierId.trim() || null;
      if (updates.supplier !== undefined) payload.supplier = updates.supplier.trim() || null;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
      if (updates.paymentDate !== undefined) payload.payment_date = updates.paymentDate ? updates.paymentDate.trim() : null;
      if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod ? updates.paymentMethod.trim() : null;
      if (updates.status !== undefined) {
        payload.status = updates.status === 'pago' ? 'paid' : updates.status === 'cancelado' ? 'canceled' : 'pending';
      }
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.isRecurring !== undefined) payload.is_recurring = updates.isRecurring;
      if (updates.recurrenceFrequency !== undefined) payload.recurrence_frequency = updates.recurrenceFrequency ? updates.recurrenceFrequency.trim() : null;
      if (updates.notes !== undefined) payload.notes = updates.notes ? updates.notes.trim() : null;
      if (updates.costCenterId !== undefined || updates.costCenter !== undefined) {
        payload.cost_center_id = await getCostCenterId(updates.costCenterId || updates.costCenter);
      }

      let updatedData: any = null;

      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .select('*, cost_centers(id, name)')
        .single();

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (fallbackError) throw fallbackError;
        updatedData = fallbackData;
      } else {
        updatedData = data;
      }

      await supabase.from('expense_history').insert([{
        expense_id: id,
        action: 'updated',
        new_data: payload
      }]);

      return { data: mapDbRowToExpense(updatedData), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao atualizar despesa.' };
    }
  }

  const existing = await listExpenses();
  const index = existing.findIndex(e => e.id === id);
  if (index === -1) return { data: null, error: 'Despesa não encontrada.' };

  const updated = { ...existing[index], ...updates, updatedAt: new Date().toISOString() };
  existing[index] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  }
  return { data: updated, error: null };
};

export const payExpense = async (id: string, paymentDate: string, paymentMethod: string): Promise<{ data: Expense | null; error: string | null }> => {
  if (!paymentDate) return { data: null, error: 'Data de pagamento é obrigatória para dar baixa.' };
  if (!paymentMethod) return { data: null, error: 'Forma de pagamento é obrigatória para dar baixa.' };

  return updateExpense(id, {
    status: 'pago',
    paymentDate,
    paymentMethod
  });
};

export const cancelExpense = async (id: string): Promise<{ data: Expense | null; error: string | null }> => {
  return updateExpense(id, { status: 'cancelado' });
};

export const deleteExpense = async (id: string): Promise<{ success: boolean; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('expenses')
        .update({ deleted_at: now })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('expense_history').insert([{
        expense_id: id,
        action: 'deleted',
        new_data: { deleted_at: now }
      }]);

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir despesa.' };
    }
  }

  const existing = await listExpenses();
  const filtered = existing.filter(e => e.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }
  return { success: true, error: null };
};
