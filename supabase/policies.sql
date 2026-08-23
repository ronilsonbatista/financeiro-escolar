-- =======================================================
-- CEBS Financeiro - Políticas de Segurança RLS (Supabase)
-- =======================================================

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- Remover políticas legadas
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON users;
DROP POLICY IF EXISTS "Permitir inserção e atualização de usuários" ON users;
DROP POLICY IF EXISTS "Permitir leitura de categorias" ON categories;
DROP POLICY IF EXISTS "Permitir gestão de categorias" ON categories;
DROP POLICY IF EXISTS "Permitir leitura de centros de custo" ON cost_centers;
DROP POLICY IF EXISTS "Permitir gestão de centros de custo" ON cost_centers;
DROP POLICY IF EXISTS "Permitir leitura de fornecedores" ON suppliers;
DROP POLICY IF EXISTS "Permitir gestão de fornecedores" ON suppliers;
DROP POLICY IF EXISTS "Permitir leitura de despesas não excluídas" ON expenses;
DROP POLICY IF EXISTS "Permitir gestão de despesas" ON expenses;
DROP POLICY IF EXISTS "Permitir leitura do histórico de despesas" ON expense_history;
DROP POLICY IF EXISTS "Permitir criação de registros de histórico" ON expense_history;
DROP POLICY IF EXISTS "Permitir leitura das configurações da escola" ON school_settings;
DROP POLICY IF EXISTS "Permitir atualização das configurações da escola" ON school_settings;
DROP POLICY IF EXISTS "Permitir leitura de receitas não excluídas" ON incomes;
DROP POLICY IF EXISTS "Permitir gestão de receitas" ON incomes;
DROP POLICY IF EXISTS "Acesso autenticado users" ON users;
DROP POLICY IF EXISTS "Acesso autenticado categories" ON categories;
DROP POLICY IF EXISTS "Acesso autenticado cost_centers" ON cost_centers;
DROP POLICY IF EXISTS "Acesso autenticado suppliers" ON suppliers;
DROP POLICY IF EXISTS "Acesso autenticado expenses" ON expenses;
DROP POLICY IF EXISTS "Acesso autenticado expense_history" ON expense_history;
DROP POLICY IF EXISTS "Acesso autenticado school_settings" ON school_settings;
DROP POLICY IF EXISTS "Acesso autenticado incomes" ON incomes;

-- -------------------------------------------------------
-- Políticas de Acesso Exclusivo para Usuários Autenticados (authenticated)
-- Usuários anônimos (anon) são totalmente bloqueados.
-- -------------------------------------------------------

-- 1. Tabela USERS
CREATE POLICY "Acesso autenticado users" ON users 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 2. Tabela CATEGORIES
CREATE POLICY "Acesso autenticado categories" ON categories 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 3. Tabela COST_CENTERS
CREATE POLICY "Acesso autenticado cost_centers" ON cost_centers 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 4. Tabela SUPPLIERS
CREATE POLICY "Acesso autenticado suppliers" ON suppliers 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 5. Tabela EXPENSES
CREATE POLICY "Acesso autenticado expenses" ON expenses 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 6. Tabela EXPENSE_HISTORY
CREATE POLICY "Acesso autenticado expense_history" ON expense_history 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 7. Tabela SCHOOL_SETTINGS
CREATE POLICY "Acesso autenticado school_settings" ON school_settings 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 8. Tabela INCOMES
CREATE POLICY "Acesso autenticado incomes" ON incomes 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);
