import { Expense, Category } from '@/types/financial';
import {
  CategoryReportItem,
  SupplierReportItem,
  StatusReportItem,
  MonthlyReportItem,
  PayablesReportItem,
  PaymentMethodReportItem,
  CostCenterReportItem
} from '@/services/reportsService';

const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const formatNumBR = (val: number): string => {
  return val.toFixed(2).replace('.', ',');
};

const sanitizeCell = (val: any): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export function downloadCSVReport({
  reportType,
  reportTitle,
  expenses,
  categories,
  categoryData,
  supplierData,
  statusData,
  monthlyData,
  payablesData,
  paymentMethodData,
  costCenterData,
}: {
  reportType: string;
  reportTitle: string;
  expenses: Expense[];
  categories: Category[];
  categoryData: CategoryReportItem[];
  supplierData: SupplierReportItem[];
  statusData: StatusReportItem[];
  monthlyData: MonthlyReportItem[];
  payablesData: PayablesReportItem[];
  paymentMethodData: PaymentMethodReportItem[];
  costCenterData: CostCenterReportItem[];
}) {
  const categoriesMap = new Map(categories.map(c => [c.id, c.name]));
  const rows: string[][] = [];

  // Title Banner
  rows.push(['CEBS Financeiro — Centro Educacional Batista Sobrinho']);
  rows.push([`Relatório: ${reportTitle}`]);
  rows.push([`Data de Geração: ${new Date().toLocaleString('pt-BR')}`]);
  rows.push([]); // Empty row

  if (reportType === 'geral') {
    rows.push(['Descrição', 'Categoria', 'Fornecedor', 'Centro de Custo', 'Vencimento', 'Data Pagamento', 'Forma Pagamento', 'Tipo', 'Status', 'Valor (R$)', 'Observações']);
    expenses.forEach(e => {
      const statusText = e.status === 'pago' ? 'Pago' : e.status === 'pendente' ? 'Pendente' : e.status === 'atrasado' ? 'Vencido' : 'Cancelado';
      rows.push([
        e.description,
        categoriesMap.get(e.categoryId) || 'Sem categoria',
        e.supplier || 'Sem fornecedor',
        e.costCenter || 'Sem centro de custo',
        formatDateBR(e.dueDate),
        formatDateBR(e.paymentDate),
        e.paymentMethod || '—',
        e.type || 'variavel',
        statusText,
        formatNumBR(e.amount),
        e.notes || ''
      ]);
    });

  } else if (reportType === 'categoria') {
    rows.push(['Categoria', 'Qtd. Despesas', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total Geral (R$)', '% sobre Total']);
    categoryData.forEach(item => {
      rows.push([
        item.categoryName,
        String(item.count),
        formatNumBR(item.totalPaid),
        formatNumBR(item.totalPending),
        formatNumBR(item.totalOverdue),
        formatNumBR(item.totalAmount),
        formatNumBR(item.percentage) + '%'
      ]);
    });

  } else if (reportType === 'fornecedor') {
    rows.push(['Fornecedor', 'Qtd. Despesas', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total Geral (R$)', '% sobre Total', 'Último Vencimento']);
    supplierData.forEach(item => {
      rows.push([
        item.supplierName,
        String(item.count),
        formatNumBR(item.totalPaid),
        formatNumBR(item.totalPending),
        formatNumBR(item.totalOverdue),
        formatNumBR(item.totalAmount),
        formatNumBR(item.percentage) + '%',
        formatDateBR(item.lastExpenseDate)
      ]);
    });

  } else if (reportType === 'status') {
    rows.push(['Status da Conta', 'Quantidade', 'Valor Total (R$)', 'Representatividade (%)']);
    statusData.forEach(item => {
      rows.push([
        item.label,
        String(item.count),
        formatNumBR(item.totalAmount),
        formatNumBR(item.percentage) + '%'
      ]);
    });

  } else if (reportType === 'mensal') {
    rows.push(['Mês / Ano', 'Qtd. Lançamentos', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total do Mês (R$)']);
    monthlyData.forEach(item => {
      rows.push([
        item.monthLabel,
        String(item.count),
        formatNumBR(item.totalPaid),
        formatNumBR(item.totalPending),
        formatNumBR(item.totalOverdue),
        formatNumBR(item.totalExpenses)
      ]);
    });

  } else if (reportType === 'contas_pagar') {
    rows.push(['Descrição', 'Categoria', 'Fornecedor', 'Vencimento', 'Situação do Prazo', 'Status', 'Valor (R$)']);
    payablesData.forEach(item => {
      const e = item.expense;
      const termStatus = item.isOverdue ? `${Math.abs(item.daysDiff)} dia(s) em atraso` : item.daysDiff === 0 ? 'Vence hoje' : `Vence em ${item.daysDiff} dia(s)`;
      rows.push([
        e.description,
        categoriesMap.get(e.categoryId) || 'Sem categoria',
        e.supplier || 'Sem fornecedor',
        formatDateBR(e.dueDate),
        termStatus,
        e.status === 'atrasado' ? 'Vencido' : 'Pendente',
        formatNumBR(e.amount)
      ]);
    });

  } else if (reportType === 'contas_pagas') {
    rows.push(['Descrição', 'Categoria', 'Fornecedor', 'Data de Pagamento', 'Forma de Pagamento', 'Status', 'Valor (R$)']);
    payablesData.forEach(item => {
      const e = item.expense;
      rows.push([
        e.description,
        categoriesMap.get(e.categoryId) || 'Sem categoria',
        e.supplier || 'Sem fornecedor',
        formatDateBR(e.paymentDate),
        e.paymentMethod || '—',
        'Pago',
        formatNumBR(e.amount)
      ]);
    });

  } else if (reportType === 'vencidas') {
    rows.push(['Descrição', 'Categoria', 'Fornecedor', 'Vencimento', 'Dias em Atraso', 'Status', 'Valor (R$)']);
    payablesData.forEach(item => {
      const e = item.expense;
      rows.push([
        e.description,
        categoriesMap.get(e.categoryId) || 'Sem categoria',
        e.supplier || 'Sem fornecedor',
        formatDateBR(e.dueDate),
        `${Math.abs(item.daysDiff)} dia(s) em atraso`,
        'Vencido',
        formatNumBR(e.amount)
      ]);
    });

  } else if (reportType === 'forma_pagamento') {
    rows.push(['Forma de Pagamento', 'Quantidade', 'Valor Total (R$)', 'Representatividade (%)']);
    paymentMethodData.forEach(item => {
      rows.push([
        item.method,
        String(item.count),
        formatNumBR(item.totalAmount),
        formatNumBR(item.percentage) + '%'
      ]);
    });

  } else if (reportType === 'centro_custo') {
    rows.push(['Centro de Custo', 'Qtd. Despesas', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total Geral (R$)', '% sobre Total']);
    costCenterData.forEach(item => {
      rows.push([
        item.costCenterName,
        String(item.count),
        formatNumBR(item.totalPaid),
        formatNumBR(item.totalPending),
        formatNumBR(item.totalOverdue),
        formatNumBR(item.totalAmount),
        formatNumBR(item.percentage) + '%'
      ]);
    });
  }

  // Construct CSV content with Semicolon and UTF-8 BOM
  const csvContent = '\uFEFF' + rows.map(row => row.map(sanitizeCell).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const dateSuffix = new Date().toISOString().slice(0, 10);
  const fileName = `relatorio-despesas-CEBS-${dateSuffix}.csv`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
