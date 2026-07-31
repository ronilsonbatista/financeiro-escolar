-- =======================================================
-- CEBS Financeiro - Schema SQL para Supabase / PostgreSQL
-- =======================================================

-- Habilitar a extensão pgcrypto para geração de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function utilitária para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- 1. Tabela: users (Usuários e Operadores do Sistema)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'financial_operator', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Usuários do sistema com permissões e funções operacionais';
COMMENT ON COLUMN users.role IS 'Perfil do usuário: admin, financial_operator ou viewer';

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- 2. Tabela: categories (Categorias Financeiras)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    type TEXT NOT NULL DEFAULT 'despesa' CHECK (type IN ('despesa', 'receita')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Categorias organizacionais para receitas e despesas';

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índice único parcial para evitar categorias ativas duplicadas (case-insensitive) do mesmo tipo
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_unique_active_name 
ON categories (LOWER(name), type) 
WHERE is_active = TRUE;

-- -------------------------------------------------------
-- 3. Tabela: cost_centers (Centros de Custo Escolares)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cost_centers IS 'Centros de Custo para alocação orçamentária escolar';

CREATE TRIGGER trg_cost_centers_updated_at
    BEFORE UPDATE ON cost_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- 4. Tabela: expenses (Lançamentos de Despesas)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    supplier TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'canceled')),
    type TEXT DEFAULT 'variavel' CHECK (type IN ('fixa', 'variavel', 'recorrente', 'extraordinaria')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_frequency TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE expenses IS 'Despesas escolares cadastradas com datas, fornecedores e baixa financeira';
COMMENT ON COLUMN expenses.status IS 'Status da conta: pending (pendente), paid (pago), overdue (vencido), canceled (cancelado)';

CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices de alta performance para despesas
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_cost_center_id ON expenses(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at ON expenses(deleted_at);

-- -------------------------------------------------------
-- 5. Tabela: expense_history (Auditoria e Histórico de Alterações)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS expense_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'paid', 'canceled', 'deleted', 'restored')),
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE expense_history IS 'Log de auditoria para rastreabilidade de alterações em despesas';

CREATE INDEX IF NOT EXISTS idx_expense_history_expense_id ON expense_history(expense_id);

-- -------------------------------------------------------
-- 6. Tabela: school_settings (Configurações Gerais da Escola)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT NOT NULL DEFAULT 'Centro Educacional Batista Sobrinho',
    trade_name TEXT DEFAULT 'CEBS',
    document_number TEXT,
    phone TEXT,
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'BRL',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE school_settings IS 'Parâmetros e dados institucionais do Centro Educacional Batista Sobrinho';

CREATE TRIGGER trg_school_settings_updated_at
    BEFORE UPDATE ON school_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- 7. Tabela: incomes (Receitas Escolares - Módulo Auxiliar)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    source TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    received_date DATE NOT NULL,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE incomes IS 'Entradas financeiras e mensalidades escolares';

CREATE TRIGGER trg_incomes_updated_at
    BEFORE UPDATE ON incomes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_incomes_category_id ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_received_date ON incomes(received_date);
CREATE INDEX IF NOT EXISTS idx_incomes_deleted_at ON incomes(deleted_at);
