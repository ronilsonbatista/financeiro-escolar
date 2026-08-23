import { supabase, isSupabaseConfigured } from './client';
import { parseSupabaseError, ParsedSupabaseError } from './handleSupabaseError';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: ParsedSupabaseError;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: {
        title: 'Erro de Configuração',
        message: 'O Supabase não está configurado. Verifique as variáveis de ambiente.',
        type: 'auth'
      }
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      const parsed = parseSupabaseError(error);
      if (parsed.type === 'generic' || parsed.type === 'auth') {
        parsed.title = 'Credenciais Inválidas';
        parsed.message = 'E-mail ou senha incorretos. Verifique os dados digitados.';
      }
      return { success: false, error: parsed };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return {
      success: false,
      error: parseSupabaseError(err)
    };
  }
}

export async function signOutUser(): Promise<{ success: boolean; error?: ParsedSupabaseError }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: parseSupabaseError(error) };
      }
    } catch (err) {
      return { success: false, error: parseSupabaseError(err) };
    }
  }
  return { success: true };
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session || null;
  } catch {
    return null;
  }
}
