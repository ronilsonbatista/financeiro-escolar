import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Category } from '@/types/financial';

const LOCAL_STORAGE_KEY = 'school_categories_v3';

export const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Aluguel', type: 'despesa', color: 'indigo', icon: 'Home', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-2', name: 'Energia', type: 'despesa', color: 'amber', icon: 'Zap', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-3', name: 'Água', type: 'despesa', color: 'sky', icon: 'Droplet', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-4', name: 'Internet', type: 'despesa', color: 'blue', icon: 'Wifi', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-5', name: 'Salários', type: 'despesa', color: 'emerald', icon: 'Users', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-6', name: 'Material escolar', type: 'despesa', color: 'purple', icon: 'BookOpen', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-7', name: 'Limpeza', type: 'despesa', color: 'teal', icon: 'Sparkles', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-8', name: 'Manutenção', type: 'despesa', color: 'rose', icon: 'Wrench', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-9', name: 'Impostos', type: 'despesa', color: 'orange', icon: 'FileText', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-10', name: 'Outros', type: 'despesa', color: 'slate', icon: 'MoreHorizontal', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cat-11', name: 'Mensalidades', type: 'receita', color: 'emerald', icon: 'GraduationCap', active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

export const listCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          icon: item.icon || 'Folder',
          color: item.color || 'blue',
          type: item.type || 'despesa',
          active: item.is_active,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar categorias do Supabase, usando fallback local:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Erro ao ler categorias do localStorage', e);
      }
    }
  }
  return defaultCategories;
};

export const createCategory = async (categoryData: Partial<Category>): Promise<{ data: Category | null; error: string | null }> => {
  const existing = await listCategories();
  const nameExists = existing.some(
    c => c.active && c.name.trim().toLowerCase() === categoryData.name?.trim().toLowerCase() && c.type === (categoryData.type || 'despesa')
  );

  if (nameExists) {
    return { data: null, error: `Já existe uma categoria ativa com o nome "${categoryData.name}".` };
  }

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        name: categoryData.name?.trim(),
        description: categoryData.description || null,
        icon: categoryData.icon || 'Folder',
        color: categoryData.color || 'blue',
        type: categoryData.type || 'despesa',
        is_active: categoryData.active !== false
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const created: Category = {
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        type: data.type,
        active: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      return { data: created, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao criar categoria no Supabase.' };
    }
  }

  // Fallback Local
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: categoryData.name?.trim() || '',
    type: categoryData.type || 'despesa',
    color: categoryData.color || 'blue',
    icon: categoryData.icon || 'Folder',
    active: categoryData.active !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedList = [...existing, newCat];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  }
  return { data: newCat, error: null };
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.active !== undefined) payload.is_active = updates.active;

      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          icon: data.icon,
          color: data.color,
          type: data.type,
          active: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao atualizar categoria.' };
    }
  }

  // Local fallback
  const existing = await listCategories();
  const index = existing.findIndex(c => c.id === id);
  if (index === -1) return { data: null, error: 'Categoria não encontrada.' };

  const updated: Category = { ...existing[index], ...updates, updatedAt: new Date().toISOString() };
  existing[index] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  }
  return { data: updated, error: null };
};

export const deleteCategory = async (id: string, isUsedInExpensesOrIncomes: boolean): Promise<{ success: boolean; message: string }> => {
  if (isUsedInExpensesOrIncomes) {
    // Regra: categoria usada deve ser desativada, não excluída
    const res = await updateCategory(id, { active: false });
    if (res.error) {
      return { success: false, message: res.error };
    }
    return { success: true, message: 'Categoria vinculada a lançamentos. Foi desativada em vez de excluída.' };
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Categoria excluída com sucesso.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao excluir categoria.' };
    }
  }

  const existing = await listCategories();
  const filtered = existing.filter(c => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }
  return { success: true, message: 'Categoria removida.' };
};
