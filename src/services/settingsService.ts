import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface SchoolSettings {
  id?: string;
  schoolName: string;
  tradeName?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  currency: string;
  dateFormat: string;
}

export const defaultSettings: SchoolSettings = {
  schoolName: 'Centro Educacional Batista Sobrinho',
  tradeName: 'CEBS',
  documentNumber: '12.345.678/0001-90',
  phone: '(73) 3531-1000',
  email: 'contato@cebs.edu.br',
  currency: 'BRL',
  dateFormat: 'DD/MM/YYYY'
};

export const getSchoolSettings = async (): Promise<SchoolSettings> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          schoolName: data.school_name,
          tradeName: data.trade_name,
          documentNumber: data.document_number,
          phone: data.phone,
          email: data.email,
          currency: data.currency,
          dateFormat: data.date_format
        };
      }
    } catch (err) {
      console.warn('Erro ao obter configurações do Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const name = localStorage.getItem('school_name_v3');
    const phone = localStorage.getItem('school_phone_v3');
    const email = localStorage.getItem('school_email_v3');
    const cnpj = localStorage.getItem('school_cnpj_v3');

    if (name || phone || email || cnpj) {
      return {
        ...defaultSettings,
        schoolName: name || defaultSettings.schoolName,
        phone: phone || defaultSettings.phone,
        email: email || defaultSettings.email,
        documentNumber: cnpj || defaultSettings.documentNumber
      };
    }
  }

  return defaultSettings;
};

export const updateSchoolSettings = async (settings: Partial<SchoolSettings>): Promise<{ data: SchoolSettings | null; error: string | null }> => {
  if (isSupabaseConfigured()) {
    try {
      const current = await getSchoolSettings();
      const payload = {
        school_name: settings.schoolName || current.schoolName,
        trade_name: settings.tradeName || current.tradeName,
        document_number: settings.documentNumber || current.documentNumber,
        phone: settings.phone || current.phone,
        email: settings.email || current.email,
        currency: settings.currency || current.currency,
        date_format: settings.dateFormat || current.dateFormat,
        updated_at: new Date().toISOString()
      };

      let resultData;
      if (current.id) {
        const { data, error } = await supabase
          .from('school_settings')
          .update(payload)
          .eq('id', current.id)
          .select()
          .single();
        if (error) throw error;
        resultData = data;
      } else {
        const { data, error } = await supabase
          .from('school_settings')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        resultData = data;
      }

      return {
        data: {
          id: resultData.id,
          schoolName: resultData.school_name,
          tradeName: resultData.trade_name,
          documentNumber: resultData.document_number,
          phone: resultData.phone,
          email: resultData.email,
          currency: resultData.currency,
          dateFormat: resultData.date_format
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao atualizar configurações no Supabase.' };
    }
  }

  // Fallback Local
  if (typeof window !== 'undefined') {
    if (settings.schoolName) localStorage.setItem('school_name_v3', settings.schoolName);
    if (settings.phone) localStorage.setItem('school_phone_v3', settings.phone);
    if (settings.email) localStorage.setItem('school_email_v3', settings.email);
    if (settings.documentNumber) localStorage.setItem('school_cnpj_v3', settings.documentNumber);
  }

  const updated = { ...(await getSchoolSettings()), ...settings };
  return { data: updated, error: null };
};
