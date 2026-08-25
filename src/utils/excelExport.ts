import ExcelJS from 'exceljs';
import { Expense, Category, Supplier } from '@/types/financial';
import {
  ReportKPIs,
  CategoryReportItem,
  SupplierReportItem,
  StatusReportItem,
  MonthlyReportItem,
  PayablesReportItem,
  PaymentMethodReportItem,
  CostCenterReportItem
} from '@/services/reportsService';

const formatBRL = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '—';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export async function exportReportToExcel({
  reportType,
  reportTitle,
  expenses,
  categories,
  suppliers,
  kpis,
  categoryData,
  supplierData,
  statusData,
  monthlyData,
  payablesData,
  paymentMethodData,
  costCenterData,
  startDateStr,
  endDateStr,
}: {
  reportType: string;
  reportTitle: string;
  expenses: Expense[];
  categories: Category[];
  suppliers: Supplier[];
  kpis: ReportKPIs;
  categoryData: CategoryReportItem[];
  supplierData: SupplierReportItem[];
  statusData: StatusReportItem[];
  monthlyData: MonthlyReportItem[];
  payablesData: PayablesReportItem[];
  paymentMethodData: PaymentMethodReportItem[];
  costCenterData: CostCenterReportItem[];
  startDateStr?: string;
  endDateStr?: string;
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEBS Financeiro';
  workbook.created = new Date();

  const sheetName = reportType.slice(0, 30);
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  // Colors
  const navyHex = '1E3280';
  const lightNavyHex = 'F4F6FC';
  const grayBorderHex = 'E2E8F0';

  // 1. HEADER INSTITUCIONAL
  const r1 = worksheet.addRow(['Centro Educacional Batista Sobrinho']);
  r1.font = { name: 'Arial', size: 14, bold: true, color: { argb: navyHex } };

  const r2 = worksheet.addRow([`CEBS Financeiro — ${reportTitle}`]);
  r2.font = { name: 'Arial', size: 12, bold: true, color: { argb: '334155' } };

  const periodText = `Período: ${formatDateBR(startDateStr)} até ${formatDateBR(endDateStr)} | Gerado em: ${new Date().toLocaleString('pt-BR')}`;
  const r3 = worksheet.addRow([periodText]);
  r3.font = { name: 'Arial', size: 10, italic: true, color: { argb: '64748B' } };

  worksheet.addRow([]); // Blank row

  // 2. CARDS DE RESUMO DO PERÍODO
  const kpiTitleRow = worksheet.addRow(['RESUMO FINANCEIRO DO PERÍODO']);
  kpiTitleRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: '475569' } };

  const kpiHeader = worksheet.addRow(['Total de Despesas', 'Total Pago', 'Total Pendente', 'Total Vencido', 'Qtd. Lançamentos', 'Ticket Médio']);
  kpiHeader.eachCell(cell => {
    cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '1E293B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightNavyHex } };
    cell.alignment = { horizontal: 'center' };
  });

  const kpiValues = worksheet.addRow([
    kpis.totalAmount,
    kpis.totalPaid,
    kpis.totalPending,
    kpis.totalOverdue,
    kpis.countTotal,
    kpis.averageAmount
  ]);

  kpiValues.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 11, bold: true };
    cell.alignment = { horizontal: 'center' };
    if (colNumber <= 4 || colNumber === 6) {
      cell.numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
    }
  });

  worksheet.addRow([]); // Blank row

  // 3. CONSTRUÇÃO DA TABELA CONFORME TIPO DE RELATÓRIO
  let headers: string[] = [];

  if (reportType === 'geral') {
    headers = ['Descrição', 'Categoria', 'Fornecedor', 'Centro de Custo', 'Vencimento', 'Data Pagamento', 'Forma Pagamento', 'Tipo', 'Status', 'Valor (R$)', 'Observações'];
  } else if (reportType === 'categoria') {
    headers = ['Categoria', 'Qtd. Despesas', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total Geral (R$)', '% sobre Total'];
  } else if (reportType === 'fornecedor') {
    headers = ['Fornecedor', 'Qtd. Despesas', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total Geral (R$)', '% sobre Total', 'Último Vencimento'];
  } else if (reportType === 'status') {
    headers = ['Status da Conta', 'Quantidade', 'Valor Total (R$)', 'Representatividade (%)'];
  } else if (reportType === 'mensal') {
    headers = ['Mês / Ano', 'Qtd. Lançamentos', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total do Mês (R$)'];
  } else if (reportType === 'contas_pagar') {
    headers = ['Descrição', 'Categoria', 'Fornecedor', 'Vencimento', 'Situação do Prazo', 'Status', 'Valor (R$)'];
  } else if (reportType === 'contas_pagas') {
    headers = ['Descrição', 'Categoria', 'Fornecedor', 'Data de Pagamento', 'Forma de Pagamento', 'Status', 'Valor (R$)'];
  } else if (reportType === 'vencidas') {
    headers = ['Descrição', 'Categoria', 'Fornecedor', 'Vencimento', 'Dias em Atraso', 'Status', 'Valor (R$)'];
  } else if (reportType === 'forma_pagamento') {
    headers = ['Forma de Pagamento', 'Quantidade', 'Valor Total (R$)', 'Representatividade (%)'];
  } else if (reportType === 'centro_custo') {
    headers = ['Centro de Custo', 'Qtd. Despesas', 'Total Pago (R$)', 'Total Pendente (R$)', 'Total Vencido (R$)', 'Total Geral (R$)', '% sobre Total'];
  }

  // Headings Row
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navyHex } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const categoriesMap = new Map(categories.map(c => [c.id, c.name]));

  // Populate Data Rows
  if (reportType === 'geral') {
    expenses.forEach(e => {
      const catName = categoriesMap.get(e.categoryId) || 'Sem categoria';
      const statusText = e.status === 'pago' ? 'Pago' : e.status === 'pendente' ? 'Pendente' : e.status === 'atrasado' ? 'Vencido' : 'Cancelado';
      
      const r = worksheet.addRow([
        e.description,
        catName,
        e.supplier || 'Sem fornecedor',
        e.costCenter || 'Sem centro de custo',
        formatDateBR(e.dueDate),
        formatDateBR(e.paymentDate),
        e.paymentMethod || '—',
        e.type || 'variavel',
        statusText,
        e.amount,
        e.notes || ''
      ]);
      r.getCell(10).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
    });

  } else if (reportType === 'categoria') {
    categoryData.forEach(item => {
      const r = worksheet.addRow([
        item.categoryName,
        item.count,
        item.totalPaid,
        item.totalPending,
        item.totalOverdue,
        item.totalAmount,
        item.percentage / 100
      ]);
      r.getCell(3).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(4).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(5).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(6).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(7).numFmt = '0.0%';
    });

  } else if (reportType === 'fornecedor') {
    supplierData.forEach(item => {
      const r = worksheet.addRow([
        item.supplierName,
        item.count,
        item.totalPaid,
        item.totalPending,
        item.totalOverdue,
        item.totalAmount,
        item.percentage / 100,
        formatDateBR(item.lastExpenseDate)
      ]);
      r.getCell(3).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(4).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(5).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(6).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(7).numFmt = '0.0%';
    });

  } else if (reportType === 'status') {
    statusData.forEach(item => {
      const r = worksheet.addRow([
        item.label,
        item.count,
        item.totalAmount,
        item.percentage / 100
      ]);
      r.getCell(3).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(4).numFmt = '0.0%';
    });

  } else if (reportType === 'mensal') {
    monthlyData.forEach(item => {
      const r = worksheet.addRow([
        item.monthLabel,
        item.count,
        item.totalPaid,
        item.totalPending,
        item.totalOverdue,
        item.totalExpenses
      ]);
      r.getCell(3).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(4).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(5).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(6).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
    });

  } else if (reportType === 'contas_pagar') {
    payablesData.forEach(item => {
      const e = item.expense;
      const catName = categoriesMap.get(e.categoryId) || 'Sem categoria';
      const termStatus = item.isOverdue ? `${Math.abs(item.daysDiff)} dia(s) em atraso` : item.daysDiff === 0 ? 'Vence hoje' : `Vence em ${item.daysDiff} dia(s)`;
      const statusText = e.status === 'atrasado' ? 'Vencido' : 'Pendente';

      const r = worksheet.addRow([
        e.description,
        catName,
        e.supplier || 'Sem fornecedor',
        formatDateBR(e.dueDate),
        termStatus,
        statusText,
        e.amount
      ]);
      r.getCell(7).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
    });

  } else if (reportType === 'contas_pagas') {
    payablesData.forEach(item => {
      const e = item.expense;
      const catName = categoriesMap.get(e.categoryId) || 'Sem categoria';

      const r = worksheet.addRow([
        e.description,
        catName,
        e.supplier || 'Sem fornecedor',
        formatDateBR(e.paymentDate),
        e.paymentMethod || '—',
        'Pago',
        e.amount
      ]);
      r.getCell(7).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
    });

  } else if (reportType === 'vencidas') {
    payablesData.forEach(item => {
      const e = item.expense;
      const catName = categoriesMap.get(e.categoryId) || 'Sem categoria';

      const r = worksheet.addRow([
        e.description,
        catName,
        e.supplier || 'Sem fornecedor',
        formatDateBR(e.dueDate),
        `${Math.abs(item.daysDiff)} dia(s) em atraso`,
        'Vencido',
        e.amount
      ]);
      r.getCell(7).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
    });

  } else if (reportType === 'forma_pagamento') {
    paymentMethodData.forEach(item => {
      const r = worksheet.addRow([
        item.method,
        item.count,
        item.totalAmount,
        item.percentage / 100
      ]);
      r.getCell(3).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(4).numFmt = '0.0%';
    });

  } else if (reportType === 'centro_custo') {
    costCenterData.forEach(item => {
      const r = worksheet.addRow([
        item.costCenterName,
        item.count,
        item.totalPaid,
        item.totalPending,
        item.totalOverdue,
        item.totalAmount,
        item.percentage / 100
      ]);
      r.getCell(3).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(4).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(5).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(6).numFmt = '"R$"#,##0.00;("R$"#,##0.00);"-"';
      r.getCell(7).numFmt = '0.0%';
    });
  }

  // 4. TOTALIZADOR NO RODAPÉ DA TABELA
  const totalsLabelRow = worksheet.addRow(['TOTALIZADORES']);
  totalsLabelRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: '0F172A' } };
  totalsLabelRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightNavyHex } };
    cell.border = { top: { style: 'thin', color: { argb: navyHex } }, bottom: { style: 'double', color: { argb: navyHex } } };
  });

  // Adjust Column Widths
  worksheet.columns.forEach(col => {
    let maxLen = 15;
    col.eachCell?.({ includeEmpty: true }, cell => {
      const valStr = cell.value ? String(cell.value) : '';
      if (valStr.length > maxLen && valStr.length < 60) {
        maxLen = valStr.length;
      }
    });
    col.width = maxLen + 4;
  });

  // Generate File Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateSuffix = new Date().toISOString().slice(0, 10);
  const fileName = `relatorio-despesas-CEBS-${dateSuffix}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
