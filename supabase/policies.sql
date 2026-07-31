-- =======================================================
-- CEBS Financeiro - Políticas de Segurança RLS (Supabase)
-- =======================================================

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Políticas para MVP Privado (Acesso Geral da Aplicação)
-- -------------------------------------------------------
-- NOTA: Para este MVP privado onde a aplicação gerencia autenticação local/chave pública,
-- permitimos leitura e escrita via anon/authenticated key. Para produção com múltiplos usuários,
-- as regras devem ser restritas por auth.uid().

-- 1. Políticas para USERS
CREATE POLICY "Permitir leitura de usuários" ON users FOR SELECT USING (true);
CREATE POLICY "Permitir inserção e atualização de usuários" ON users FOR ALL USING (true);

-- 2. Políticas para CATEGORIES
CREATE POLICY "Permitir leitura de categorias" ON categories FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de categorias" ON categories FOR ALL USING (true);

-- 3. Políticas para COST_CENTERS
CREATE POLICY "Permitir leitura de centros de custo" ON cost_centers FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de centros de custo" ON cost_centers FOR ALL USING (true);

-- 4. Políticas para EXPENSES
CREATE POLICY "Permitir leitura de despesas não excluídas" ON expenses FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Permitir gestão de despesas" ON expenses FOR ALL USING (true);

-- 5. Políticas para EXPENSE_HISTORY
CREATE POLICY "Permitir leitura do histórico de despesas" ON expense_history FOR SELECT USING (true);
CREATE POLICY "Permitir criação de registros de histórico" ON expense_history FOR INSERT WITH CHECK (true);

-- 6. Políticas para SCHOOL_SETTINGS
CREATE POLICY "Permitir leitura das configurações da escola" ON school_settings FOR SELECT USING (true);
CREATE POLICY "Permitir atualização das configurações da escola" ON school_settings FOR ALL USING (true);

-- 7. Políticas para INCOMES
CREATE POLICY "Permitir leitura de receitas não excluídas" ON incomes FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Permitir gestão de receitas" ON incomes FOR ALL USING (true);
