# CEBS Financeiro

Sistema web de controle financeiro escolar para gestão de despesas, categorias, pagamentos, indicadores e relatórios administrativos do **Centro Educacional Batista Sobrinho**.

---

## 🎯 Objetivo

O **CEBS Financeiro** foi desenvolvido sob medida para o **Centro Educacional Batista Sobrinho (CEBS)** para auxiliar a instituição no controle interno de gastos operacionais. O objetivo é unificar a gestão de contas a pagar, vencimentos, baixas, cancelamentos e relatórios em uma interface moderna, clean e livre de distrações, proporcionando total visibilidade das despesas do período.

---

## ✨ Principais Funcionalidades

- **Dashboard de Gastos**:
  - Indicadores financeiros consolidados (Total de despesas, quitadas, pendentes, vencidas e contagem de lançamentos).
  - Gráfico horizontal segmentado mostrando a proporção dos status financeiros.
  - Gráfico de evolução mensal customizado.
  - Barra de progresso para visualização da distribuição de gastos por categoria.
  - Ocultamento inteligente de receitas para foco principal nas saídas de caixa.
- **Módulo de Despesas**:
  - Listagem detalhada e intuitiva de lançamentos em formato tabular e grid de cards responsivo para dispositivos móveis.
  - Formulário completo para cadastro e edição de despesas com suporte a fornecedor, centro de custo e notas.
  - Fluxo de baixa protegida (exigindo data de quitação e método de pagamento).
  - Cancelamento rápido de despesas e exclusão lógica segura via `deleted_at`.
- **Módulo de Categorias**:
  - Cadastro de novas categorias com cores exclusivas associadas para realce visual.
  - Regra de ativação/desativação de categorias.
  - Validação integrada contra duplicidade de nomes (case-insensitive).
  - Proteção de exclusão para impedir a deleção de categorias que possuam despesas ativas vinculadas.
- **Filtros e Relatórios**:
  - Filtros rápidos por período (Mês atual, Mês anterior, Últimos 3 meses, Últimos 6 meses, Ano atual ou Período personalizado com seletores inline).
  - Painel de filtros avançados por descrição, status, forma de pagamento, faixa de valores e centro de custo.
  - Relatório analítico detalhado com opção para exportação em formato CSV.
- **Configurações Institucionais**:
  - Painel de controle para gerenciar dados da instituição (Nome da escola, Fantasia, Telefone, E-mail e Centros de custo).
  - Configuração de preferências de runtime, como o controle de bloqueio de edição para competências trancadas.
- **Gestão de Usuários**:
  - Tabela visual de operadores e níveis de acesso (Administrador, Operador, Visualizador).
- **Persistência Híbrida / Banco de Dados Real**:
  - Integração com **Supabase (PostgreSQL)** para persistência oficial em nuvem.
  - Fallback automático para `localStorage` local em modo offline ou em desenvolvimento sem credenciais configuradas.
- **Interface Premium e Responsiva**:
  - Totalmente responsiva com suporte a menu lateral (sidebar) adaptativo no celular via botão Hambúrguer e backdrop semi-transparente.
  - Tipografia moderna (Inter) e paleta oficial da escola baseada no mascote CEBS.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [Next.js](https://nextjs.org/) (v16) & [React](https://react.dev/) (v19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styles**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Tests**: [Vitest](https://vitest.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🗄️ Banco de Dados (Supabase / PostgreSQL)

O sistema utiliza o **Supabase** (PostgreSQL) como banco de dados principal.

### Arquivos SQL

Os scripts para criação da estrutura e dados iniciais estão organizados na pasta `supabase/`:

- `supabase/schema.sql`: Criação das tabelas (`users`, `categories`, `cost_centers`, `expenses`, `expense_history`, `school_settings`, `incomes`), índices de performance, restrições e triggers automáticos de `updated_at`.
- `supabase/seed.sql`: Carga inicial de dados limpos (configurações da escola, usuário admin inicial, 10 categorias padrão, 9 centros de custo e 1 despesa inicial de demonstração).
- `supabase/policies.sql`: Configuração de segurança Row Level Security (RLS) para proteção das tabelas.

### Criar banco no Supabase

1. Crie uma conta e um novo projeto em [supabase.com](https://supabase.com/).
2. No painel do seu projeto Supabase, acesse a aba **SQL Editor**.
3. Execute o conteúdo de `supabase/schema.sql` para criar a estrutura do banco.
4. Execute o conteúdo de `supabase/seed.sql` para popular com os dados iniciais.
5. Execute o conteúdo de `supabase/policies.sql` para aplicar as políticas RLS.
6. Em **Project Settings -> API**, copie a **Project URL** e a **anon public key**.

---

## 🔑 Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto baseado no `.env.example`:

```env
NEXT_PUBLIC_APP_NAME="CEBS Financeiro"
NEXT_PUBLIC_SCHOOL_NAME="Centro Educacional Batista Sobrinho"

# Fonte de dados: 'supabase' (nuvem/produção) ou 'local' (localStorage fallback)
NEXT_PUBLIC_DATA_SOURCE="supabase"

# Credenciais do Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-aqui"

# Chave de Serviço (Apenas no servidor/APIs, NUNCA expor no client-side)
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-aqui"
```

---

## 📂 Estrutura do Projeto

```
src/
├── app/                  # Páginas, layout e estilos globais (Next.js App Router)
├── components/           # Componentes modulares reutilizáveis (Tabelas, Filtros, Gráficos)
├── lib/                  # Clientes do Supabase (client.ts e server.ts)
├── services/             # Camada de serviços/acesso a dados (expensesService, categoriesService, etc.)
├── tests/                # Suíte de testes unitários com Vitest
├── types/                # Definições de tipos e interfaces do TypeScript
supabase/
├── schema.sql            # Definição do schema SQL e tabelas PostgreSQL
├── seed.sql              # Carga inicial limpa de demonstração
└── policies.sql          # Configuração de segurança Row Level Security (RLS)
public/                   # Imagens e logo da instituição
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em seu computador.

### Passo a Passo

1. **Clonar o Repositório**
   ```bash
   git clone <url-do-repositorio>
   cd financeiro-escolar
   ```

2. **Instalar Dependências**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**
   ```bash
   cp .env.example .env.local
   ```
   Preencha as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os valores do seu projeto Supabase.

4. **Iniciar o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse o endereço [http://localhost:3000](http://localhost:3000) no seu navegador.

5. **Rodar os Testes Unitários**
   ```bash
   npx vitest run
   ```

6. **Gerar Versão de Produção (Build)**
   ```bash
   npm run build
   ```

---

## ☁️ Deploy na Vercel

Este projeto está pronto para ser hospedado na **Vercel**:

1. Suba o repositório para o seu **GitHub**.
2. No painel da **Vercel**, clique em **New Project** e importe o repositório.
3. Nas **Environment Variables** da Vercel, adicione as seguintes variáveis:
   - `NEXT_PUBLIC_APP_NAME` = `CEBS Financeiro`
   - `NEXT_PUBLIC_SCHOOL_NAME` = `Centro Educacional Batista Sobrinho`
   - `NEXT_PUBLIC_DATA_SOURCE` = `supabase`
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sua-chave-anon-aqui`
   - `SUPABASE_SERVICE_ROLE_KEY` = `sua-chave-service-role-aqui` *(opcional, usada apenas em chamadas server-side)*
4. Clique em **Deploy**.

---

## 🛡️ Observações de Segurança

- **Chaves Privadas**: A chave `SUPABASE_SERVICE_ROLE_KEY` **nunca** deve ser utilizada no lado do cliente (navegador). Utilize-a apenas em Server Components ou Server Actions.
- **Arquivos `.env`**: Os arquivos `.env`, `.env.local` e credenciais reais estão devidamente inclusos no `.gitignore` para prevenir vamentos acidentais em repositórios públicos.
- **Row Level Security (RLS)**: Mantenha as políticas RLS ativas em produção. Em ambientes de produção multi-tenant, configure autenticação real no Supabase (`auth.uid()`).
