-- =======================================================
-- CEBS Financeiro - Seed Inicial de Dados para Supabase
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
    'Maria Souza (Diretoria)',
    'diretoria@cebs.edu.br',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 3. Inserir Categorias Básicas de Despesas
INSERT INTO categories (id, name, description, icon, color, type, is_active) VALUES
('22222222-2222-2222-2222-222222222201', 'Aluguel', 'Locação de imóveis e estruturas físicas', 'Home', 'indigo', 'despesa', true),
('22222222-2222-2222-2222-222222222202', 'Energia', 'Conta de energia elétrica', 'Zap', 'amber', 'despesa', true),
('22222222-2222-2222-2222-222222222203', 'Água', 'Fornecimento e tratamento de água', 'Droplet', 'sky', 'despesa', true),
('22222222-2222-2222-2222-222222222204', 'Internet', 'Link de dados e infraestrutura de rede', 'Wifi', 'blue', 'despesa', true),
('22222222-2222-2222-2222-222222222205', 'Salários', 'Folha de pagamento dos colaboradores', 'Users', 'emerald', 'despesa', true),
('22222222-2222-2222-2222-222222222206', 'Material escolar', 'Suprimentos pedagógicos e didáticos', 'BookOpen', 'purple', 'despesa', true),
('22222222-2222-2222-2222-222222222207', 'Limpeza', 'Produtos e serviços de higienização', 'Sparkles', 'teal', 'despesa', true),
('22222222-2222-2222-2222-222222222208', 'Manutenção', 'Reparos estruturais e prediais', 'Wrench', 'rose', 'despesa', true),
('22222222-2222-2222-2222-222222222209', 'Impostos', 'Tributos municipais, estaduais e federais', 'FileText', 'orange', 'despesa', true),
('22222222-2222-2222-2222-222222222210', 'Outros', 'Despesas operacionais diversas', 'MoreHorizontal', 'slate', 'despesa', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Centros de Custo Básicos
INSERT INTO cost_centers (id, name, description, is_active) VALUES
('33333333-3333-3333-3333-333333333301', 'Administração', 'Gestão administrativa e financeira central', true),
('33333333-3333-3333-3333-333333333302', 'Coordenação', 'Equipe pedagógica e coordenação de ensino', true),
('33333333-3333-3333-3333-333333333303', 'Educação Infantil', 'Segmento da Educação Infantil', true),
('33333333-3333-3333-3333-333333333304', 'Ensino Fundamental', 'Segmento do Ensino Fundamental I e II', true),
('33333333-3333-3333-3333-333333333305', 'Ensino Médio', 'Segmento do Ensino Médio', true),
('33333333-3333-3333-3333-333333333306', 'Limpeza', 'Equipe de serviços gerais e conservação', true),
('33333333-3333-3333-3333-333333333307', 'Manutenção', 'Reparos e infraestrutura física', true),
('33333333-3333-3333-3333-333333333308', 'Tecnologia', 'Sistemas, equipamentos e rede da escola', true),
('33333333-3333-3333-3333-333333333309', 'Eventos', 'Datas comemorativas, formaturas e projetos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir Fornecedores Iniciais Básicos
INSERT INTO suppliers (id, name, document_number, phone, email, notes, is_active) VALUES
('55555555-5555-5555-5555-555555555501', 'Neoenergia Coelba', '15.135.617/0001-43', '0800 071 0800', 'atendimento@coelba.com.br', 'Concessionária de energia elétrica', true),
('55555555-5555-5555-5555-555555555502', 'Papelaria & Cia', '22.333.444/0001-55', '(73) 3531-2020', 'vendas@papelariaecia.com.br', 'Fornecedor de material escolar e escritório', true),
('55555555-5555-5555-5555-555555555503', 'ServTec Manutenção', '33.444.555/0001-66', '(73) 99988-7766', 'contato@servtec.com.br', 'Prestador de manutenção predial e elétrica', true),
('55555555-5555-5555-5555-555555555504', 'Outros', NULL, NULL, NULL, 'Fornecedores diversos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Inserir 1 Despesa Fake Única de Demonstração
INSERT INTO expenses (
    id,
    description,
    category_id,
    cost_center_id,
    supplier_id,
    supplier,
    amount,
    due_date,
    status,
    type,
    notes,
    created_by
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'Energia elétrica',
    '22222222-2222-2222-2222-222222222202', -- Categoria Energia
    '33333333-3333-3333-3333-333333333301', -- Centro Administração
    '55555555-5555-5555-5555-555555555501', -- Fornecedor Coelba
    'Neoenergia Coelba',
    350.00,
    CURRENT_DATE + INTERVAL '10 days',
    'pending',
    'variavel',
    'Despesa inicial de demonstração',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;
