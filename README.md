# CEBS Financeiro

Sistema web de controle financeiro escolar para gestão de despesas, categorias, pagamentos, indicadores e relatórios administrativos.

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
  - Listagem detalhada e intuitiva de lançamentos em formato tabular.
  - Formulário completo para cadastro e edição de despesas.
  - Fluxo de baixa protegida (exigindo data de quitação e método de pagamento).
  - Cancelamento rápido de despesas e exclusão definitiva condicionada a modais de confirmação.
- **Módulo de Categorias**:
  - Cadastro de novas categorias com cores exclusivas associadas para realce visual.
  - Regra de ativação/desativação de categorias.
  - Validação integrada contra duplicidade de nomes.
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
- **Interface Premium e Responsiva**:
  - Totalmente responsiva com suporte a menu lateral (sidebar) adaptativo no celular via botão Hambúrguer e backdrop semi-transparente.
  - Tipografia moderna (Inter) e paleta oficial da escola baseada no mascote CEBS.
  - Persistência contínua dos dados no navegador via `localStorage`.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [Next.js](https://nextjs.org/) (v16) & [React](https://react.dev/) (v19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styles**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Tests**: [Vitest](https://vitest.dev/)
- **Storage**: Browser `localStorage` (com transição segura e persistência estruturada)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📂 Estrutura do Projeto

```
src/
├── app/                  # Páginas, layout e estilos globais (Next.js App Router)
├── components/           # Componentes modulares reutilizáveis (Tabelas, Filtros, Gráficos)
├── tests/                # Suíte de testes unitários
├── types/                # Definições de tipos e interfaces do TypeScript
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
   Copie o arquivo de exemplo `.env.example` e crie um arquivo local `.env` (se necessário):
   ```bash
   cp .env.example .env
   ```

4. **Iniciar o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse o endereço [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando.

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

Este projeto está pronto para ser hospedado diretamente na **Vercel**:
1. Conecte o repositório GitHub ao painel da Vercel.
2. Defina o framework como **Next.js**.
3. O build command será detectado automaticamente (`next build`).
4. Caso prefira subir via Vercel CLI, execute na raiz do projeto:
   ```bash
   vercel
   ```
