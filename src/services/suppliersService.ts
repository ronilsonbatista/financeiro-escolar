import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Supplier } from '@/types/financial';

const LOCAL_STORAGE_KEY = 'school_suppliers_v3';

export const defaultSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Neoenergia Coelba', documentNumber: '15.135.617/0001-43', phone: '0800 071 0800', email: 'atendimento@coelba.com.br', notes: 'Concessionária de energia elétrica', isActive: true },
  { id: 'sup-2', name: 'Papelaria & Cia', documentNumber: '22.333.444/0001-55', phone: '(73) 3531-2020', email: 'vendas@papelariaecia.com.br', notes: 'Fornecedor de material escolar e escritório', isActive: true },
  { id: 'sup-3', name: 'ServTec Manutenção', documentNumber: '33.444.555/0001-66', phone: '(73) 99988-7766', email: 'contato@servtec.com.br', notes: 'Prestador de manutenção predial e elétrica', isActive: true },
  { id: 'sup-4', name: 'Outros', isActive: true }
];

export const listSuppliers = async (): Promise<Supplier[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          documentNumber: item.document_number || undefined,
          phone: item.phone || undefined,
          email: item.email || undefined,
          notes: item.notes || undefined,
          isActive: item.is_active,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar fornecedores do Supabase, usando fallback local:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Erro ao ler fornecedores do localStorage', e);
      }
    }
  }
  return defaultSuppliers;
};

export const createSupplier = async (supplierData: Partial<Supplier>): Promise<{ data: Supplier | null; error: string | null }> => {
  if (!supplierData.name?.trim()) {
    return { data: null, error: 'O nome do fornecedor é obrigatório.' };
  }

  const existing = await listSuppliers();
  const nameExists = existing.some(
    s => s.isActive && s.name.trim().toLowerCase() === supplierData.name?.trim().toLowerCase()
  );

  if (nameExists) {
    return { data: null, error: `Já existe um fornecedor ativo cadastrado com o nome "${supplierData.name}".` };
  }

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        name: supplierData.name.trim(),
        document_number: supplierData.documentNumber?.trim() || null,
        phone: supplierData.phone?.trim() || null,
        email: supplierData.email?.trim() || null,
        notes: supplierData.notes || null,
        is_active: supplierData.isActive !== false
      };

      const { data, error } = await supabase
        .from('suppliers')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const created: Supplier = {
        id: data.id,
        name: data.name,
        documentNumber: data.document_number || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        notes: data.notes || undefined,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { data: created, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao criar fornecedor no Supabase.' };
    }
  }

  // Local Storage Fallback
  const newSup: Supplier = {
    id: `sup-${Date.now()}`,
    name: supplierData.name.trim(),
    documentNumber: supplierData.documentNumber?.trim(),
    phone: supplierData.phone?.trim(),
    email: supplierData.email?.trim(),
    notes: supplierData.notes,
    isActive: supplierData.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedList = [...existing, newSup];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  }
  return { data: newSup, error: null };
};

export const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<{ data: Supplier | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.documentNumber !== undefined) payload.document_number = updates.documentNumber.trim() || null;
      if (updates.phone !== undefined) payload.phone = updates.phone.trim() || null;
      if (updates.email !== undefined) payload.email = updates.email.trim() || null;
      if (updates.notes !== undefined) payload.notes = updates.notes || null;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          name: data.name,
          documentNumber: data.document_number || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          notes: data.notes || undefined,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao atualizar fornecedor.' };
    }
  }

  const existing = await listSuppliers();
  const index = existing.findIndex(s => s.id === id);
  if (index === -1) return { data: null, error: 'Fornecedor não encontrado.' };

  const updated: Supplier = { ...existing[index], ...updates, updatedAt: new Date().toISOString() };
  existing[index] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  }
  return { data: updated, error: null };
};

export const deleteSupplier = async (id: string, isUsedInExpenses: boolean): Promise<{ success: boolean; message: string }> => {
  if (isUsedInExpenses) {
    // Regra: fornecedor usado em despesas deve ser desativado, não excluído
    const res = await updateSupplier(id, { isActive: false });
    if (res.error) {
      return { success: false, message: res.error };
    }
    return { success: true, message: 'Fornecedor vinculado a lançamentos existentes. Foi desativado em vez de excluído.' };
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Fornecedor excluído com sucesso.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao excluir fornecedor.' };
    }
  }

  const existing = await listSuppliers();
  const filtered = existing.filter(s => s.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }
  return { success: true, message: 'Fornecedor removido.' };
};
