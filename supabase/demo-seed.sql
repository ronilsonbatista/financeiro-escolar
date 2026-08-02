-- ============================================================================
-- CEBS FINANCEIRO - DEMO SEED DATA (supabase/demo-seed.sql)
-- Script para carga de dados de demonstração realistas para ambiente escolar
-- ============================================================================

-- 1. ADICIONAR COLUNA IS_DEMO SE NÃO EXISTIR
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- 2. CATEGORIAS DE DEMONSTRAÇÃO (14 Categorias)
INSERT INTO categories (id, name, type, color, icon, active, is_demo) VALUES
  ('cat-demo-1',  'Salários',            'despesa', 'indigo',  'Users',          true, true),
  ('cat-demo-2',  'Aluguel',             'despesa', 'amber',   'Building2',      true, true),
  ('cat-demo-3',  'Energia',             'despesa', 'yellow',  'Zap',            true, true),
  ('cat-demo-4',  'Água',                'despesa', 'sky',     'Droplet',        true, true),
  ('cat-demo-5',  'Internet',            'despesa', 'blue',    'Wifi',           true, true),
  ('cat-demo-6',  'Material escolar',    'despesa', 'emerald', 'BookOpen',       true, true),
  ('cat-demo-7',  'Limpeza',             'despesa', 'teal',    'Sparkles',       true, true),
  ('cat-demo-8',  'Manutenção',          'despesa', 'orange',  'Wrench',         true, true),
  ('cat-demo-9',  'Impostos',            'despesa', 'red',     'Receipt',        true, true),
  ('cat-demo-10', 'Alimentação',         'despesa', 'rose',    'Utensils',       true, true),
  ('cat-demo-11', 'Tecnologia',          'despesa', 'violet',  'Laptop',         true, true),
  ('cat-demo-12', 'Transporte',          'despesa', 'cyan',    'Truck',          true, true),
  ('cat-demo-13', 'Eventos escolares',   'despesa', 'fuchsia', 'Megaphone',      true, true),
  ('cat-demo-14', 'Outros',              'despesa', 'zinc',    'MoreHorizontal', true, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_demo = true;

-- 3. FORNECEDORES DE DEMONSTRAÇÃO (12 Fornecedores)
INSERT INTO suppliers (id, name, document_number, phone, email, notes, is_active, is_demo) VALUES
  ('sup-demo-1',  'Imobiliária Batista',      '12.345.678/0001-11', '(81) 3222-1100', 'financeiro@imobiliariabatista.com.br', 'Locação do prédio escolar', true, true),
  ('sup-demo-2',  'Enel Distribuição',       '06.057.223/0001-55', '(81) 0800-280',  'atendimento@enel.com.br',            'Fornecimento de energia elétrica', true, true),
  ('sup-demo-3',  'Cedae Companhia de Água',  '33.352.394/0001-04', '(81) 0800-071',  'comercial@cedae.com.br',             'Fornecimento de água e esgoto', true, true),
  ('sup-demo-4',  'Claro Empresas',           '40.432.544/0001-47', '(81) 0800-721',  'empresas@claro.com.br',              'Link dedicado de fibra óptica 500MB', true, true),
  ('sup-demo-5',  'Papelaria Central',        '18.990.123/0001-88', '(81) 3455-9988', 'vendas@papelariacentral.com.br',      'Materiais didáticos e de escritório', true, true),
  ('sup-demo-6',  'Limpeza Total Serviços',   '22.111.444/0001-99', '(81) 3344-5566', 'contato@limpezatotal.com.br',        'Serviços terceirizados de conservação', true, true),
  ('sup-demo-7',  'TechEdu Sistemas',         '09.876.543/0001-22', '(81) 3003-4455', 'suporte@techedu.com.br',             'Plataforma de gestão escolar e portal', true, true),
  ('sup-demo-8',  'Mercado Escolar',          '05.432.109/0001-33', '(81) 3266-7788', 'pedidos@mercadoescolar.com.br',      'Alimentação para cantina e eventos', true, true),
  ('sup-demo-9',  'Transporte Educacional RJ','15.678.901/0001-44', '(81) 9988-7766', 'frota@transporteedu.com.br',        'Ônibus para excursões e passeios', true, true),
  ('sup-demo-10', 'Contabilidade Silva',      '07.123.456/0001-77', '(81) 3421-8899', 'fiscal@contabilidadesilva.com.br',    'Assessoria contábil e trabalhista', true, true),
  ('sup-demo-11', 'Manutenção Predial Alfa',  '28.345.678/0001-66', '(81) 9911-2233', 'servicos@alfamanutencao.com.br',    'Manutenção elétrica e hidráulica', true, true),
  ('sup-demo-12', 'Gráfica Escola Viva',      '14.567.890/0001-33', '(81) 3322-4411', 'artes@graficaescolaviva.com.br',      'Impressão de apostilas e comunicados', true, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_demo = true;

-- 4. DESPESAS DE DEMONSTRAÇÃO (25 Despesas Realistas)
INSERT INTO expenses (id, description, category_id, supplier_id, supplier, amount, due_date, payment_date, payment_method, status, type, is_recurring, recurrence_frequency, cost_center, notes, is_demo) VALUES
  -- Mês de Maio/2026 (Pagas)
  ('exp-demo-01', 'Aluguel do prédio escolar - Maio',       'cat-demo-2',  'sup-demo-1',  'Imobiliária Batista',       8500.00, '2026-05-10', '2026-05-09', 'Transferência', 'pago', 'fixa', true, 'mensal', 'Administração', 'Quitado em dia via PIX bancário', true),
  ('exp-demo-02', 'Energia elétrica - Maio',               'cat-demo-3',  'sup-demo-2',  'Enel Distribuição',        1280.40, '2026-05-15', '2026-05-14', 'PIX', 'pago', 'variavel', false, NULL, 'Administração', 'Fatura quitada', true),
  ('exp-demo-03', 'Fornecimento de água - Maio',           'cat-demo-4',  'sup-demo-3',  'Cedae Companhia de Água',   690.30, '2026-05-20', '2026-05-18', 'Boleto', 'pago', 'variavel', false, NULL, 'Limpeza', 'Consumo normal do bloco A', true),
  ('exp-demo-04', 'Internet fibra dedicada - Maio',        'cat-demo-5',  'sup-demo-4',  'Claro Empresas',            349.90, '2026-05-25', '2026-05-25', 'Débito automático', 'pago', 'fixa', true, 'mensal', 'Tecnologia', 'Link 500MB principal', true),
  ('exp-demo-05', 'Folha de pagamento professores - Maio', 'cat-demo-1',  NULL,          'Folha Interna CEBS',       24500.00, '2026-05-05', '2026-05-05', 'PIX', 'pago', 'fixa', true, 'mensal', 'Coordenação', 'Salários do corpo docente', true),

  -- Mês de Junho/2026 (Pagas)
  ('exp-demo-06', 'Aluguel do prédio escolar - Junho',      'cat-demo-2',  'sup-demo-1',  'Imobiliária Batista',       8500.00, '2026-06-10', '2026-06-10', 'Transferência', 'pago', 'fixa', true, 'mensal', 'Administração', 'Pagamento confirmado', true),
  ('exp-demo-07', 'Energia elétrica - Junho',              'cat-demo-3',  'sup-demo-2',  'Enel Distribuição',        1420.80, '2026-06-15', '2026-06-12', 'PIX', 'pago', 'variavel', false, NULL, 'Administração', 'Consumo elevado devido a eventos', true),
  ('exp-demo-08', 'Serviço de limpeza terceirizada - Junho','cat-demo-7', 'sup-demo-6',  'Limpeza Total Serviços',    3200.00, '2026-06-05', '2026-06-04', 'PIX', 'pago', 'recorrente', true, 'mensal', 'Limpeza', 'Contrato mensal de conservação', true),
  ('exp-demo-09', 'Licenciamento de software TechEdu',     'cat-demo-11', 'sup-demo-7',  'TechEdu Sistemas',           599.00, '2026-06-18', '2026-06-18', 'Cartão', 'pago', 'recorrente', true, 'mensal', 'Tecnologia', 'Mensalidade do sistema escolar', true),
  ('exp-demo-10', 'Honorários contábeis mensais',          'cat-demo-9',  'sup-demo-10', 'Contabilidade Silva',       980.00, '2026-06-22', '2026-06-21', 'Boleto', 'pago', 'fixa', true, 'mensal', 'Administração', 'Assessoria fiscal e balancete', true),

  -- Mês de Julho/2026 (Pagas, Pendentes e Vencidas)
  ('exp-demo-11', 'Aluguel do prédio escolar - Julho',      'cat-demo-2',  'sup-demo-1',  'Imobiliária Batista',       8500.00, '2026-07-10', '2026-07-09', 'Transferência', 'pago', 'fixa', true, 'mensal', 'Administração', 'Quitado via transferência bancária', true),
  ('exp-demo-12', 'Compra de material escolar e papéis',   'cat-demo-6',  'sup-demo-5',  'Papelaria Central',         2450.00, '2026-07-12', '2026-07-12', 'PIX', 'pago', 'extraordinaria', false, NULL, 'Ensino Fundamental', 'Kits para o segundo semestre', true),
  ('exp-demo-13', 'Manutenção elétrica e preventiva',       'cat-demo-8',  'sup-demo-11', 'Manutenção Predial Alfa',     850.00, '2026-07-15', NULL, NULL, 'atrasado', 'variavel', false, NULL, 'Manutenção', 'Reparo dos disjuntores do bloco B', true),
  ('exp-demo-14', 'Transporte para excursão pedagógica',   'cat-demo-12', 'sup-demo-9',  'Transporte Educacional RJ', 1750.00, '2026-07-28', NULL, NULL, 'pendente', 'extraordinaria', false, NULL, 'Eventos', 'Ônibus para visita ao museu', true),
  ('exp-demo-15', 'Lanche e coffee break reunião pais',    'cat-demo-10', 'sup-demo-8',  'Mercado Escolar',            730.00, '2026-07-20', '2026-07-20', 'PIX', 'pago', 'extraordinaria', false, NULL, 'Coordenação', 'Fornecimento de salgados e sucos', true),
  ('exp-demo-16', 'Impressão de comunicados e apostilas',  'cat-demo-13', 'sup-demo-12', 'Gráfica Escola Viva',         420.00, '2026-07-25', NULL, NULL, 'cancelado', 'extraordinaria', false, NULL, 'Eventos', 'Pedido cancelado por mudança de layout', true),
  ('exp-demo-17', 'Internet fibra dedicada - Julho',        'cat-demo-5',  'sup-demo-4',  'Claro Empresas',            349.90, '2026-07-25', '2026-07-25', 'Débito automático', 'pago', 'fixa', true, 'mensal', 'Tecnologia', 'Fatura mensal de Julho', true),
  ('exp-demo-18', 'Energia elétrica - Julho',              'cat-demo-3',  'sup-demo-2',  'Enel Distribuição',        1390.20, '2026-07-30', NULL, NULL, 'pendente', 'variavel', false, NULL, 'Administração', 'Fatura enviada para agendamento', true),

  -- Mês de Agosto/2026 (Ciclo Atual / Projeção)
  ('exp-demo-19', 'Aluguel do prédio escolar - Agosto',     'cat-demo-2',  'sup-demo-1',  'Imobiliária Batista',       8500.00, '2026-08-10', NULL, NULL, 'pendente', 'fixa', true, 'mensal', 'Administração', 'A vencer no dia 10', true),
  ('exp-demo-20', 'Serviço de limpeza terceirizada - Ago', 'cat-demo-7', 'sup-demo-6',  'Limpeza Total Serviços',    3200.00, '2026-08-05', NULL, NULL, 'pendente', 'recorrente', true, 'mensal', 'Limpeza', 'A vencer no dia 05', true),
  ('exp-demo-21', 'Licenciamento de software TechEdu - Ago','cat-demo-11', 'sup-demo-7',  'TechEdu Sistemas',           599.00, '2026-08-18', NULL, NULL, 'pendente', 'recorrente', true, 'mensal', 'Tecnologia', 'A vencer no dia 18', true),
  ('exp-demo-22', 'Honorários contábeis - Agosto',          'cat-demo-9',  'sup-demo-10', 'Contabilidade Silva',       980.00, '2026-08-22', NULL, NULL, 'pendente', 'fixa', true, 'mensal', 'Administração', 'A vencer no dia 22', true),
  ('exp-demo-23', 'Compra de refis e produtos de higiene', 'cat-demo-7',  'sup-demo-5',  'Papelaria Central',          450.00, '2026-08-12', NULL, NULL, 'pendente', 'variavel', false, NULL, 'Limpeza', 'Sabão líquido, álcool e papel toalha', true),
  ('exp-demo-24', 'Manutenção nos ar-condicionados',        'cat-demo-8',  'sup-demo-11', 'Manutenção Predial Alfa',    1100.00, '2026-08-15', NULL, NULL, 'pendente', 'variavel', false, NULL, 'Manutenção', 'Higienização dos aparelhos das salas 1 a 6', true),
  ('exp-demo-25', 'Impressão de agendas escolares 2026/2',  'cat-demo-13', 'sup-demo-12', 'Gráfica Escola Viva',        1850.00, '2026-08-20', NULL, NULL, 'pendente', 'extraordinaria', false, NULL, 'Educação Infantil', 'Agendas personalizadas para alunos', true)
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, is_demo = true;
