import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Income } from '@/types/financial';

const LOCAL_STORAGE_KEY = 'school_incomes_v3';

export const listIncomes = async (): Promise<Income[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .is('deleted_at', null)
        .order('received_date', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map(row => ({
          id: row.id,
          description: row.description,
          source: row.source || '',
          categoryId: row.category_id || '',
          amount: Number(row.amount),
          receivedDate: row.received_date,
          paymentMethod: row.payment_method || undefined,
          notes: row.notes || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar receitas do Supabase, usando localStorage fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return [];
};

export const createIncome = async (incomeData: Partial<Income>): Promise<{ data: Income | null; error: string | null }> => {
  if (!incomeData.description?.trim()) return { data: null, error: 'Descrição é obrigatória.' };
  if (!incomeData.amount || incomeData.amount <= 0) return { data: null, error: 'Valor deve ser positivo.' };
  if (!incomeData.receivedDate) return { data: null, error: 'Data de recebimento é obrigatória.' };

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        description: incomeData.description.trim(),
        category_id: incomeData.categoryId || null,
        source: incomeData.source || null,
        amount: incomeData.amount,
        received_date: incomeData.receivedDate,
        payment_method: incomeData.paymentMethod || null,
        notes: incomeData.notes || null
      };

      const { data, error } = await supabase
        .from('incomes')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          description: data.description,
          source: data.source || '',
          categoryId: data.category_id || '',
          amount: Number(data.amount),
          receivedDate: data.received_date,
          paymentMethod: data.payment_method,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao criar receita.' };
    }
  }

  const existing = await listIncomes();
  const newInc: Income = {
    id: `inc-${Date.now()}`,
    description: incomeData.description.trim(),
    source: incomeData.source || '',
    categoryId: incomeData.categoryId || '',
    amount: incomeData.amount,
    receivedDate: incomeData.receivedDate,
    paymentMethod: incomeData.paymentMethod,
    notes: incomeData.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newInc, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
  return { data: newInc, error: null };
};

export const updateIncome = async (id: string, updates: Partial<Income>): Promise<{ data: Income | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.description !== undefined) payload.description = updates.description.trim();
      if (updates.source !== undefined) payload.source = updates.source;
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.receivedDate !== undefined) payload.received_date = updates.receivedDate;
      if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      const { data, error } = await supabase
        .from('incomes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          description: data.description,
          source: data.source || '',
          categoryId: data.category_id || '',
          amount: Number(data.amount),
          receivedDate: data.received_date,
          paymentMethod: data.payment_method,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao atualizar receita.' };
    }
  }

  const existing = await listIncomes();
  const idx = existing.findIndex(i => i.id === id);
  if (idx === -1) return { data: null, error: 'Receita não encontrada.' };

  const updated = { ...existing[idx], ...updates, updatedAt: new Date().toISOString() };
  existing[idx] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  }
  return { data: updated, error: null };
};

export const deleteIncome = async (id: string): Promise<{ success: boolean; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('incomes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir receita.' };
    }
  }

  const existing = await listIncomes();
  const filtered = existing.filter(i => i.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }
  return { success: true, error: null };
};
