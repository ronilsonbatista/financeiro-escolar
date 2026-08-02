import { Category, Supplier, Expense } from '@/types/financial';
import { listCategories, createCategory } from './categoriesService';
import { listSuppliers, createSupplier } from './suppliersService';
import { listExpenses, createExpense, deleteExpense } from './expensesService';

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-demo-1',  name: 'Salários',            type: 'despesa', color: 'indigo',  icon: 'Users',          active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-2',  name: 'Aluguel',             type: 'despesa', color: 'amber',   icon: 'Building2',      active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-3',  name: 'Energia',             type: 'despesa', color: 'yellow',  icon: 'Zap',            active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-4',  name: 'Água',                type: 'despesa', color: 'sky',     icon: 'Droplet',        active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-5',  name: 'Internet',            type: 'despesa', color: 'blue',    icon: 'Wifi',           active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-6',  name: 'Material escolar',    type: 'despesa', color: 'emerald', icon: 'BookOpen',       active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-7',  name: 'Limpeza',             type: 'despesa', color: 'teal',    icon: 'Sparkles',       active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-8',  name: 'Manutenção',          type: 'despesa', color: 'orange',  icon: 'Wrench',         active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-9',  name: 'Impostos',            type: 'despesa', color: 'red',     icon: 'Receipt',        active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-10', name: 'Alimentação',         type: 'despesa', color: 'rose',    icon: 'Utensils',       active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-11', name: 'Tecnologia',          type: 'despesa', color: 'violet',  icon: 'Laptop',         active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-12', name: 'Transporte',          type: 'despesa', color: 'cyan',    icon: 'Truck',          active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-13', name: 'Eventos escolares',   type: 'despesa', color: 'fuchsia', icon: 'Megaphone',      active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'cat-demo-14', name: 'Outros',              type: 'despesa', color: 'zinc',    icon: 'MoreHorizontal', active: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
];

export const DEMO_SUPPLIERS: Supplier[] = [
  { id: 'sup-demo-1',  name: 'Imobiliária Batista',      documentNumber: '12.345.678/0001-11', phone: '(81) 3222-1100', email: 'financeiro@imobiliariabatista.com.br', notes: 'Locação do prédio escolar', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-2',  name: 'Enel Distribuição',       documentNumber: '06.057.223/0001-55', phone: '(81) 0800-280',  email: 'atendimento@enel.com.br',            notes: 'Fornecimento de energia elétrica', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-3',  name: 'Cedae Companhia de Água',  documentNumber: '33.352.394/0001-04', phone: '(81) 0800-071',  email: 'comercial@cedae.com.br',             notes: 'Fornecimento de água e esgoto', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-4',  name: 'Claro Empresas',           documentNumber: '40.432.544/0001-47', phone: '(81) 0800-721',  email: 'empresas@claro.com.br',              notes: 'Link dedicado de fibra óptica 500MB', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-5',  name: 'Papelaria Central',        documentNumber: '18.990.123/0001-88', phone: '(81) 3455-9988', email: 'vendas@papelariacentral.com.br',      notes: 'Materiais didáticos e de escritório', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-6',  name: 'Limpeza Total Serviços',   documentNumber: '22.111.444/0001-99', phone: '(81) 3344-5566', email: 'contato@limpezatotal.com.br',        notes: 'Serviços terceirizados de conservação', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-7',  name: 'TechEdu Sistemas',         documentNumber: '09.876.543/0001-22', phone: '(81) 3003-4455', email: 'suporte@techedu.com.br',             notes: 'Plataforma de gestão escolar e portal', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-8',  name: 'Mercado Escolar',          documentNumber: '05.432.109/0001-33', phone: '(81) 3266-7788', email: 'pedidos@mercadoescolar.com.br',      notes: 'Alimentação para cantina e eventos', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-9',  name: 'Transporte Educacional RJ',documentNumber: '15.678.901/0001-44', phone: '(81) 9988-7766', email: 'frota@transporteedu.com.br',        notes: 'Ônibus para excursões e passeios', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-10', name: 'Contabilidade Silva',      documentNumber: '07.123.456/0001-77', phone: '(81) 3421-8899', email: 'fiscal@contabilidadesilva.com.br',    notes: 'Assessoria contábil e trabalhista', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-11', name: 'Manutenção Predial Alfa',  documentNumber: '28.345.678/0001-66', phone: '(81) 9911-2233', email: 'servicos@alfamanutencao.com.br',    notes: 'Manutenção elétrica e hidráulica', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'sup-demo-12', name: 'Gráfica Escola Viva',      documentNumber: '14.567.890/0001-33', phone: '(81) 3322-4411', email: 'artes@graficaescolaviva.com.br',      notes: 'Impressão de apostilas e comunicados', isActive: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
];

export const DEMO_EXPENSES: Expense[] = [
  // Maio/2026
  { id: 'exp-demo-01', description: 'Aluguel do prédio escolar - Maio',       categoryId: 'cat-demo-2',  supplierId: 'sup-demo-1',  supplier: 'Imobiliária Batista',       amount: 8500.00, dueDate: '2026-05-10', paymentDate: '2026-05-09', paymentMethod: 'Transferência', status: 'pago',      type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Administração',      notes: 'Quitado em dia via PIX bancário', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-09T00:00:00Z' },
  { id: 'exp-demo-02', description: 'Energia elétrica - Maio',               categoryId: 'cat-demo-3',  supplierId: 'sup-demo-2',  supplier: 'Enel Distribuição',        amount: 1280.40, dueDate: '2026-05-15', paymentDate: '2026-05-14', paymentMethod: 'PIX',           status: 'pago',      type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Administração',      notes: 'Fatura quitada', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-14T00:00:00Z' },
  { id: 'exp-demo-03', description: 'Fornecimento de água - Maio',           categoryId: 'cat-demo-4',  supplierId: 'sup-demo-3',  supplier: 'Cedae Companhia de Água',   amount: 690.30,  dueDate: '2026-05-20', paymentDate: '2026-05-18', paymentMethod: 'Boleto',        status: 'pago',      type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Limpeza',            notes: 'Consumo normal do bloco A', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-18T00:00:00Z' },
  { id: 'exp-demo-04', description: 'Internet fibra dedicada - Maio',        categoryId: 'cat-demo-5',  supplierId: 'sup-demo-4',  supplier: 'Claro Empresas',            amount: 349.90,  dueDate: '2026-05-25', paymentDate: '2026-05-25', paymentMethod: 'Débito automático', status: 'pago', type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Tecnologia',         notes: 'Link 500MB principal', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-25T00:00:00Z' },
  { id: 'exp-demo-05', description: 'Folha de pagamento professores - Maio', categoryId: 'cat-demo-1',  supplierId: undefined,     supplier: 'Folha Interna CEBS',       amount: 24500.00,dueDate: '2026-05-05', paymentDate: '2026-05-05', paymentMethod: 'PIX',           status: 'pago',      type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Coordenação',        notes: 'Salários do corpo docente', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-05T00:00:00Z' },

  // Junho/2026
  { id: 'exp-demo-06', description: 'Aluguel do prédio escolar - Junho',      categoryId: 'cat-demo-2',  supplierId: 'sup-demo-1',  supplier: 'Imobiliária Batista',       amount: 8500.00, dueDate: '2026-06-10', paymentDate: '2026-06-10', paymentMethod: 'Transferência', status: 'pago',      type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Administração',      notes: 'Pagamento confirmado', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
  { id: 'exp-demo-07', description: 'Energia elétrica - Junho',              categoryId: 'cat-demo-3',  supplierId: 'sup-demo-2',  supplier: 'Enel Distribuição',        amount: 1420.80, dueDate: '2026-06-15', paymentDate: '2026-06-12', paymentMethod: 'PIX',           status: 'pago',      type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Administração',      notes: 'Consumo elevado devido a eventos', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
  { id: 'exp-demo-08', description: 'Serviço de limpeza terceirizada - Junho',categoryId: 'cat-demo-7', supplierId: 'sup-demo-6',  supplier: 'Limpeza Total Serviços',    amount: 3200.00, dueDate: '2026-06-05', paymentDate: '2026-06-04', paymentMethod: 'PIX',           status: 'pago',      type: 'recorrente',     isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Limpeza',            notes: 'Contrato mensal de conservação', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-04T00:00:00Z' },
  { id: 'exp-demo-09', description: 'Licenciamento de software TechEdu',     categoryId: 'cat-demo-11', supplierId: 'sup-demo-7',  supplier: 'TechEdu Sistemas',           amount: 599.00,  dueDate: '2026-06-18', paymentDate: '2026-06-18', paymentMethod: 'Cartão',        status: 'pago',      type: 'recorrente',     isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Tecnologia',         notes: 'Mensalidade do sistema escolar', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-18T00:00:00Z' },
  { id: 'exp-demo-10', description: 'Honorários contábeis mensais',          categoryId: 'cat-demo-9',  supplierId: 'sup-demo-10', supplier: 'Contabilidade Silva',       amount: 980.00,  dueDate: '2026-06-22', paymentDate: '2026-06-21', paymentMethod: 'Boleto',        status: 'pago',      type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Administração',      notes: 'Assessoria fiscal e balancete', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-21T00:00:00Z' },

  // Julho/2026
  { id: 'exp-demo-11', description: 'Aluguel do prédio escolar - Julho',      categoryId: 'cat-demo-2',  supplierId: 'sup-demo-1',  supplier: 'Imobiliária Batista',       amount: 8500.00, dueDate: '2026-07-10', paymentDate: '2026-07-09', paymentMethod: 'Transferência', status: 'pago',      type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Administração',      notes: 'Quitado via transferência bancária', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-09T00:00:00Z' },
  { id: 'exp-demo-12', description: 'Compra de material escolar e papéis',   categoryId: 'cat-demo-6',  supplierId: 'sup-demo-5',  supplier: 'Papelaria Central',         amount: 2450.00, dueDate: '2026-07-12', paymentDate: '2026-07-12', paymentMethod: 'PIX',           status: 'pago',      type: 'extraordinaria', isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Ensino Fundamental', notes: 'Kits para o segundo semestre', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z' },
  { id: 'exp-demo-13', description: 'Manutenção elétrica e preventiva',       categoryId: 'cat-demo-8',  supplierId: 'sup-demo-11', supplier: 'Manutenção Predial Alfa',     amount: 850.00,  dueDate: '2026-07-15', paymentDate: undefined,    paymentMethod: undefined, status: 'atrasado',  type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Manutenção',          notes: 'Reparo dos disjuntores do bloco B', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'exp-demo-14', description: 'Transporte para excursão pedagógica',   categoryId: 'cat-demo-12', supplierId: 'sup-demo-9',  supplier: 'Transporte Educacional RJ', amount: 1750.00, dueDate: '2026-07-28', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'extraordinaria', isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Eventos',             notes: 'Ônibus para visita ao museu', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 'exp-demo-15', description: 'Lanche e coffee break reunião pais',    categoryId: 'cat-demo-10', supplierId: 'sup-demo-8',  supplier: 'Mercado Escolar',            amount: 730.00,  dueDate: '2026-07-20', paymentDate: '2026-07-20', paymentMethod: 'PIX',           status: 'pago',      type: 'extraordinaria', isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Coordenação',        notes: 'Fornecimento de salgados e sucos', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-20T00:00:00Z' },
  { id: 'exp-demo-16', description: 'Impressão de comunicados e apostilas',  categoryId: 'cat-demo-13', supplierId: 'sup-demo-12', supplier: 'Gráfica Escola Viva',         amount: 420.00,  dueDate: '2026-07-25', paymentDate: undefined,    paymentMethod: undefined, status: 'cancelado', type: 'extraordinaria', isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Eventos',             notes: 'Pedido cancelado por mudança de layout', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-25T00:00:00Z' },
  { id: 'exp-demo-17', description: 'Internet fibra dedicada - Julho',        categoryId: 'cat-demo-5',  supplierId: 'sup-demo-4',  supplier: 'Claro Empresas',            amount: 349.90,  dueDate: '2026-07-25', paymentDate: '2026-07-25', paymentMethod: 'Débito automático', status: 'pago', type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Tecnologia',         notes: 'Fatura mensal de Julho', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-25T00:00:00Z' },
  { id: 'exp-demo-18', description: 'Energia elétrica - Julho',              categoryId: 'cat-demo-3',  supplierId: 'sup-demo-2',  supplier: 'Enel Distribuição',        amount: 1390.20, dueDate: '2026-07-30', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Administração',      notes: 'Fatura enviada para agendamento', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },

  // Agosto/2026
  { id: 'exp-demo-19', description: 'Aluguel do prédio escolar - Agosto',     categoryId: 'cat-demo-2',  supplierId: 'sup-demo-1',  supplier: 'Imobiliária Batista',       amount: 8500.00, dueDate: '2026-08-10', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Administração',      notes: 'A vencer no dia 10', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'exp-demo-20', description: 'Serviço de limpeza terceirizada - Ago', categoryId: 'cat-demo-7',  supplierId: 'sup-demo-6',  supplier: 'Limpeza Total Serviços',    amount: 3200.00, dueDate: '2026-08-05', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'recorrente',     isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Limpeza',            notes: 'A vencer no dia 05', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'exp-demo-21', description: 'Licenciamento de software TechEdu - Ago',categoryId: 'cat-demo-11', supplierId: 'sup-demo-7',  supplier: 'TechEdu Sistemas',           amount: 599.00,  dueDate: '2026-08-18', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'recorrente',     isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Tecnologia',         notes: 'A vencer no dia 18', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'exp-demo-22', description: 'Honorários contábeis - Agosto',          categoryId: 'cat-demo-9',  supplierId: 'sup-demo-10', supplier: 'Contabilidade Silva',       amount: 980.00,  dueDate: '2026-08-22', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'fixa',           isRecurring: true,  recurrenceFrequency: 'mensal', costCenter: 'Administração',      notes: 'A vencer no dia 22', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'exp-demo-23', description: 'Compra de refis e produtos de higiene', categoryId: 'cat-demo-7',  supplierId: 'sup-demo-5',  supplier: 'Papelaria Central',         amount: 450.00,  dueDate: '2026-08-12', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Limpeza',            notes: 'Sabão líquido, álcool e papel toalha', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'exp-demo-24', description: 'Manutenção nos ar-condicionados',        categoryId: 'cat-demo-8',  supplierId: 'sup-demo-11', supplier: 'Manutenção Predial Alfa',    amount: 1100.00, dueDate: '2026-08-15', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'variavel',       isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Manutenção',          notes: 'Higienização dos aparelhos das salas 1 a 6', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'exp-demo-25', description: 'Impressão de agendas escolares 2026/2',  categoryId: 'cat-demo-13', supplierId: 'sup-demo-12', supplier: 'Gráfica Escola Viva',        amount: 1850.00, dueDate: '2026-08-20', paymentDate: undefined,    paymentMethod: undefined, status: 'pendente',  type: 'extraordinaria', isRecurring: false, recurrenceFrequency: undefined,costCenter: 'Educação Infantil', notes: 'Agendas personalizadas para alunos', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' }
];

export async function loadDemoDataSafely(): Promise<{ categories: Category[]; suppliers: Supplier[]; expenses: Expense[] }> {
  // Fetch existing
  const [existingCats, existingSups, existingExps] = await Promise.all([
    listCategories(),
    listSuppliers(),
    listExpenses()
  ]);

  // Insert categories if not existing
  for (const cat of DEMO_CATEGORIES) {
    if (!existingCats.some(c => c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase())) {
      await createCategory({
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        active: cat.active
      });
    }
  }

  // Insert suppliers if not existing
  for (const sup of DEMO_SUPPLIERS) {
    if (!existingSups.some(s => s.id === sup.id || s.name.toLowerCase() === sup.name.toLowerCase())) {
      await createSupplier({
        name: sup.name,
        documentNumber: sup.documentNumber,
        phone: sup.phone,
        email: sup.email,
        notes: sup.notes,
        isActive: sup.isActive
      });
    }
  }

  // Reload categories & suppliers to get mapped IDs
  const freshCats = await listCategories();
  const freshSups = await listSuppliers();

  // Insert expenses avoiding duplicate entries
  for (const exp of DEMO_EXPENSES) {
    if (!existingExps.some(e => e.id === exp.id || e.description.toLowerCase() === exp.description.toLowerCase())) {
      const catMatch = freshCats.find(c => c.id === exp.categoryId || c.name.toLowerCase() === DEMO_CATEGORIES.find(dc => dc.id === exp.categoryId)?.name.toLowerCase());
      const supMatch = freshSups.find(s => s.id === exp.supplierId || s.name.toLowerCase() === exp.supplier.toLowerCase());

      await createExpense({
        description: exp.description,
        categoryId: catMatch ? catMatch.id : freshCats[0]?.id || 'cat-15',
        supplierId: supMatch ? supMatch.id : undefined,
        supplier: exp.supplier,
        amount: exp.amount,
        dueDate: exp.dueDate,
        paymentDate: exp.paymentDate,
        paymentMethod: exp.paymentMethod,
        status: exp.status,
        type: exp.type,
        isRecurring: exp.isRecurring,
        recurrenceFrequency: exp.recurrenceFrequency,
        costCenter: exp.costCenter,
        notes: exp.notes
      });
    }
  }

  const finalCats = await listCategories();
  const finalSups = await listSuppliers();
  const finalExps = await listExpenses();

  return {
    categories: finalCats,
    suppliers: finalSups,
    expenses: finalExps
  };
}

export async function clearDemoDataSafely(): Promise<void> {
  const allExps = await listExpenses();
  const demoExps = allExps.filter(e => e.id.includes('demo') || e.description.includes('Maio') || e.description.includes('Junho') || e.description.includes('Julho') || e.description.includes('Agosto'));

  for (const exp of demoExps) {
    await deleteExpense(exp.id);
  }
}
