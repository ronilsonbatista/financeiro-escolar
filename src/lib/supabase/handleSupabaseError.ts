export interface ParsedSupabaseError {
  title: string;
  message: string;
  type: 'duplicate' | 'rls' | 'auth' | 'schema' | 'network' | 'generic';
}

export function parseSupabaseError(error: any): ParsedSupabaseError {
  if (!error) {
    return {
      title: 'Erro ao salvar',
      message: 'Não foi possível concluir a operação. Tente novamente.',
      type: 'generic'
    };
  }

  const code = String(error?.code || '');
  const details = String(error?.details || '');
  const hint = String(error?.hint || '');
  const msg = typeof error === 'string' ? error : String(error?.message || error?.error_description || '');
  const fullText = `${msg} ${details} ${hint} ${code}`.toLowerCase();

  // 1. Erro de Duplicidade (PostgreSQL 23505, duplicate key, unique constraint, já existe)
  if (code === '23505' || fullText.includes('duplicate key') || fullText.includes('unique constraint') || fullText.includes('already exists') || fullText.includes('já existe')) {
    return {
      title: 'Erro de Duplicidade',
      message: msg && !msg.includes('duplicate key') ? msg : 'Já existe um registro cadastrado com estas informações.',
      type: 'duplicate'
    };
  }

  // 2. Erro de RLS (Row Level Security)
  if (fullText.includes('new row violates row-level security policy') || fullText.includes('row-level security') || fullText.includes('violates row-level security')) {
    return {
      title: 'Permissão negada',
      message: 'As políticas de segurança do Supabase bloquearam esta ação.',
      type: 'rls'
    };
  }

  // 3. Erro de API Key
  if (fullText.includes('invalid api key') || fullText.includes('api key not found') || fullText.includes('jwt')) {
    return {
      title: 'Erro de conexão',
      message: 'A chave do Supabase está inválida ou ausente.',
      type: 'auth'
    };
  }

  // 4. Erro de Schema / Coluna inexistente
  if (fullText.includes('could not find the') || (fullText.includes('column') && fullText.includes('schema cache')) || fullText.includes('schema cache')) {
    return {
      title: 'Erro de integração',
      message: 'O sistema tentou enviar um campo que não existe no banco. Verifique o mapeamento do Supabase.',
      type: 'schema'
    };
  }

  // 5. Erro de Rede / Conexão
  if (fullText.includes('failed to fetch') || fullText.includes('network') || fullText.includes('connection') || fullText.includes('enotfound') || fullText.includes('econnrefused')) {
    return {
      title: 'Falha de conexão',
      message: 'Não foi possível conectar ao banco de dados.',
      type: 'network'
    };
  }

  // 6. Erro Desconhecido / Genérico
  return {
    title: 'Erro ao salvar',
    message: msg && !msg.startsWith('[object') ? msg : 'Não foi possível concluir a operação. Tente novamente.',
    type: 'generic'
  };
}
