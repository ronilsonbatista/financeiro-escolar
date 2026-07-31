import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface CostCenter {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const LOCAL_STORAGE_KEY = 'school_cost_centers_v3';

export const defaultCostCenters: CostCenter[] = [
  { id: 'cc-1', name: 'Administração', description: 'Gestão administrativa e financeira central', active: true },
  { id: 'cc-2', name: 'Coordenação', description: 'Equipe pedagógica e coordenação', active: true },
  { id: 'cc-3', name: 'Educação Infantil', description: 'Segmento da Educação Infantil', active: true },
  { id: 'cc-4', name: 'Ensino Fundamental', description: 'Segmento do Ensino Fundamental I e II', active: true },
  { id: 'cc-5', name: 'Ensino Médio', description: 'Segmento do Ensino Médio', active: true },
  { id: 'cc-6', name: 'Limpeza', description: 'Serviços gerais e conservação', active: true },
  { id: 'cc-7', name: 'Manutenção', description: 'Reparos e infraestrutura predial', active: true },
  { id: 'cc-8', name: 'Tecnologia', description: 'Sistemas e equipamentos de informática', active: true },
  { id: 'cc-9', name: 'Eventos', description: 'Projetos e datas comemorativas', active: true },
];

export const listCostCenters = async (): Promise<CostCenter[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          active: item.is_active,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar centros de custo do Supabase, usando fallback:', err);
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
  return defaultCostCenters;
};

export const createCostCenter = async (name: string, description?: string): Promise<{ data: CostCenter | null; error: string | null }> => {
  if (!name.trim()) return { data: null, error: 'Nome do centro de custo é obrigatório.' };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('cost_centers')
        .insert([{ name: name.trim(), description: description || null, is_active: true }])
        .select()
        .single();

      if (error) throw error;
      return {
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          active: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao criar centro de custo.' };
    }
  }

  const existing = await listCostCenters();
  const newCC: CostCenter = { id: `cc-${Date.now()}`, name: name.trim(), description, active: true };
  const updated = [...existing, newCC];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
  return { data: newCC, error: null };
};
