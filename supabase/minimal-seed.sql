-- =======================================================
-- CEBS Financeiro - Minimal Seed (Produção / Cliente)
-- =======================================================

-- 1. Inserir Configurações Institucionais da Escola
INSERT INTO school_settings (
    id,
    school_name,
    trade_name,
    document_number,
    phone,
    email,
    currency,
    date_format
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Centro Educacional Batista Sobrinho',
    'CEBS',
    '12.345.678/0001-90',
    '(73) 3531-1000',
    'contato@cebs.edu.br',
    'BRL',
    'DD/MM/YYYY'
) ON CONFLICT (id) DO NOTHING;

-- 2. Inserir Usuário Administrador Inicial
INSERT INTO users (
    id,
    name,
    email,
    role,
    is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Administrador CEBS',
    'admin@cebs.com.br',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;
