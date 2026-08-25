"use client";

import React, { useState, useMemo } from 'react';
import { Expense, Category, Supplier, TransactionStatus } from '@/types/financial';
import {
  FileSpreadsheet, Download, Printer, FilterX, Search, Calendar,
  DollarSign, CheckCircle2, Clock, AlertTriangle, Hash, PieChart,
  Tag, Truck, Building2, ChevronRight, Layers, ArrowUpRight
} from 'lucide-react';
import CurrencyValue from '@/components/CurrencyValue';
import {
  ReportFilterOptions,
  getFilteredExpenses,
  calculateReportKPIs,
  getCategoryReport,
  getSupplierReport,
  getStatusReport,
  getMonthlyReport,
  getPayablesReport,
  getPaymentMethodReport,
  getCostCenterReport
} from '@/services/reportsService';
import { exportReportToExcel } from '@/utils/excelExport';
import { downloadCSVReport } from '@/utils/csvExport';

interface ReportsViewProps {
  allExpenses: Expense[];
  categories: Category[];
  suppliers: Supplier[];
}

export type ReportTypeKey =
  | 'geral'
  | 'categoria'
  | 'fornecedor'
  | 'status'
  | 'mensal'
  | 'contas_pagar'
  | 'contas_pagas'
  | 'vencidas'
  | 'forma_pagamento'
  | 'centro_custo';

export default function ReportsView({ allExpenses, categories, suppliers }: ReportsViewProps) {
  // Report Selector State
  const [activeReportType, setActiveReportType] = useState<ReportTypeKey>('geral');

  // Filter States
  const [datePeriodOption, setDatePeriodOption] = useState<'all' | 'current_month' | 'last_month' | 'last_30' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [supplierId, setSupplierId] = useState('all');
  const [status, setStatus] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [costCenter, setCostCenter] = useState('');
  const [expenseType, setExpenseType] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingExcel, setExportingExcel] = useState(false);

  // Handle Quick Date Options
  const handlePeriodOptionChange = (option: typeof datePeriodOption) => {
    setDatePeriodOption(option);
    const today = new Date();

    if (option === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (option === 'current_month') {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${lastDay}`);
    } else if (option === 'last_month') {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const y = prev.getFullYear();
      const m = String(prev.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, prev.getMonth() + 1, 0).getDate();
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${lastDay}`);
    } else if (option === 'last_30') {
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past30.toISOString().slice(0, 10));
      setEndDate(today.toISOString().slice(0, 10));
    }
  };

  // Reset Filters
  const handleClearFilters = () => {
    setDatePeriodOption('all');
    setStartDate('');
    setEndDate('');
    setCategoryId('all');
    setSupplierId('all');
    setStatus('all');
    setPaymentMethod('all');
    setCostCenter('');
    setExpenseType('all');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
  };

  // Filter Options Object
  const filterOptions: ReportFilterOptions = useMemo(() => {
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId: categoryId !== 'all' ? categoryId : undefined,
      supplierId: supplierId !== 'all' ? supplierId : undefined,
      status: status !== 'all' ? status : undefined,
      paymentMethod: paymentMethod !== 'all' ? paymentMethod : undefined,
      costCenter: costCenter.trim() || undefined,
      expenseType: expenseType !== 'all' ? expenseType : undefined,
      minAmount: minAmount !== '' ? Number(minAmount) : undefined,
      maxAmount: maxAmount !== '' ? Number(maxAmount) : undefined,
      searchQuery: searchQuery.trim() || undefined,
    };
  }, [startDate, endDate, categoryId, supplierId, status, paymentMethod, costCenter, expenseType, minAmount, maxAmount, searchQuery]);

  // Filtered Expenses List
  const filteredExpenses = useMemo(() => {
    return getFilteredExpenses(allExpenses, filterOptions);
  }, [allExpenses, filterOptions]);

  // KPIs
  const kpis = useMemo(() => {
    return calculateReportKPIs(filteredExpenses, categories, suppliers);
  }, [filteredExpenses, categories, suppliers]);

  // Specialized Aggregated Data
  const categoryData = useMemo(() => getCategoryReport(filteredExpenses, categories), [filteredExpenses, categories]);
  const supplierData = useMemo(() => getSupplierReport(filteredExpenses), [filteredExpenses]);
  const statusData = useMemo(() => getStatusReport(filteredExpenses), [filteredExpenses]);
  const monthlyData = useMemo(() => getMonthlyReport(filteredExpenses), [filteredExpenses]);
  const payablesAllData = useMemo(() => getPayablesReport(filteredExpenses, 'all_payables'), [filteredExpenses]);
  const payablesPaidData = useMemo(() => getPayablesReport(filteredExpenses, 'paid_only'), [filteredExpenses]);
  const payablesOverdueData = useMemo(() => getPayablesReport(filteredExpenses, 'overdue_only'), [filteredExpenses]);
  const paymentMethodData = useMemo(() => getPaymentMethodReport(filteredExpenses), [filteredExpenses]);
  const costCenterData = useMemo(() => getCostCenterReport(filteredExpenses), [filteredExpenses]);

  // Map Categories & Suppliers
  const categoriesMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  // Report Titles Mapping
  const reportTitles: Record<ReportTypeKey, string> = {
    geral: 'Relatório Geral de Despesas',
    categoria: 'Relatório por Categoria',
    fornecedor: 'Relatório por Fornecedor',
    status: 'Relatório por Status da Conta',
    mensal: 'Relatório Mensal de Gastos',
    contas_pagar: 'Relatório de Contas a Pagar',
    contas_pagas: 'Relatório de Contas Pagas',
    vencidas: 'Relatório de Despesas Vencidas',
    forma_pagamento: 'Relatório por Forma de Pagamento',
    centro_custo: 'Relatório por Centro de Custo',
  };

  // Handlers for Export
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await exportReportToExcel({
        reportType: activeReportType,
        reportTitle: reportTitles[activeReportType],
        expenses: filteredExpenses,
        categories,
        suppliers,
        kpis,
        categoryData,
        supplierData,
        statusData,
        monthlyData,
        payablesData: activeReportType === 'contas_pagas' ? payablesPaidData : activeReportType === 'vencidas' ? payablesOverdueData : payablesAllData,
        paymentMethodData,
        costCenterData,
        startDateStr: startDate,
        endDateStr: endDate,
      });
    } catch (err) {
      console.error('Erro ao gerar Excel:', err);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportCSV = () => {
    downloadCSVReport({
      reportType: activeReportType,
      reportTitle: reportTitles[activeReportType],
      expenses: filteredExpenses,
      categories,
      categoryData,
      supplierData,
      statusData,
      monthlyData,
      payablesData: activeReportType === 'contas_pagas' ? payablesPaidData : activeReportType === 'vencidas' ? payablesOverdueData : payablesAllData,
      paymentMethodData,
      costCenterData,
    });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '—';
    const parts = dateStr.slice(0, 10).split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const getStatusBadge = (s: TransactionStatus) => {
    if (s === 'pago') return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#EAF5F0', color: '#2E7D57', border: '1px solid rgba(46,125,87,0.2)' }}>Pago</span>;
    if (s === 'pendente') return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#FFF8EB', color: '#B9891C', border: '1px solid rgba(185,137,28,0.2)' }}>Pendente</span>;
    if (s === 'atrasado') return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#FEF2F2', color: '#B94A48', border: '1px solid rgba(185,74,72,0.2)' }}>Vencido</span>;
    return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }}>Cancelado</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
      
      {/* ── 1. CABEÇALHO DA SEÇÃO DE RELATÓRIOS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Relatórios Financeiros
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
            Acompanhamento analítico de despesas, pagamentos, fornecedores, categorias e centros de custo do CEBS.
          </p>
        </div>

        {/* Botões de Ação / Exportação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            title="Exportar planilha Excel formatada (.xlsx)"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px',
              backgroundColor: '#1E3280', color: '#FFFFFF', fontSize: '12px', fontWeight: 700,
              border: 'none', cursor: exportingExcel ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(30,50,128,0.2)', transition: 'background-color 0.15s'
            }}
          >
            <FileSpreadsheet size={15} />
            <span>{exportingExcel ? 'Gerando Excel...' : 'Exportar Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Exportar arquivo CSV (.csv)"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px',
              backgroundColor: '#FFFFFF', color: '#1E3280', fontSize: '12px', fontWeight: 700,
              border: '1.5px solid #1E3280', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            title="Imprimir ou Salvar em PDF"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', borderRadius: '8px',
              backgroundColor: '#F8FAFC', color: '#475569', fontSize: '12px', fontWeight: 600,
              border: '1.5px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* ── 2. CARDS DE RESUMO KPI (9 Métricas) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        
        {/* Total Despesas */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Despesas</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB' }}><DollarSign size={14} /></div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{formatBRL(kpis.totalAmount)}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{kpis.countTotal} lançamentos</span>
        </div>

        {/* Total Pago */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pago</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#16A34A' }}><CheckCircle2 size={14} /></div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803D' }}>{formatBRL(kpis.totalPaid)}</div>
          <span style={{ fontSize: '11px', color: '#166534', fontWeight: 500 }}>{kpis.totalAmount > 0 ? `${((kpis.totalPaid / kpis.totalAmount) * 100).toFixed(1)}% do total` : '0%'}</span>
        </div>

        {/* Total Pendente */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pendente</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#FFFBEB', color: '#D97706' }}><Clock size={14} /></div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#B45309' }}>{formatBRL(kpis.totalPending)}</div>
          <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 500 }}>A vencer no prazo</span>
        </div>

        {/* Total Vencido */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Vencido</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626' }}><AlertTriangle size={14} /></div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#B91C1C' }}>{formatBRL(kpis.totalOverdue)}</div>
          <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: 500 }}>Atenção requerida</span>
        </div>

        {/* Ticket Médio */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Médio</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569' }}><PieChart size={14} /></div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{formatBRL(kpis.averageAmount)}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Por despesa</span>
        </div>

        {/* Maior Despesa */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maior Despesa</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F8FAFC', color: '#64748B' }}><ArrowUpRight size={14} /></div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{kpis.highestExpense ? formatBRL(kpis.highestExpense.amount) : 'R$ 0,00'}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {kpis.highestExpense ? kpis.highestExpense.description : 'Sem lançamentos'}
          </span>
        </div>

        {/* Principal Categoria */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Categoria</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#1E3280' }}><Tag size={14} /></div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E3280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kpis.topCategoryName}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Maior volume financeiro</span>
        </div>

        {/* Principal Fornecedor */}
        <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Fornecedor</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#D97706' }}><Truck size={14} /></div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kpis.topSupplierName}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Principal parceiro</span>
        </div>

      </div>

      {/* ── 3. PAINEL DE FILTROS AVANÇADOS ── */}
      <div style={{ padding: '20px 24px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '13px' }}>
            <Calendar size={16} color="#1E3280" />
            <span>Filtros do Relatório</span>
          </div>
          <button
            onClick={handleClearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            <FilterX size={13} />
            <span>Limpar Filtros</span>
          </button>
        </div>

        {/* Primary Filter Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
          
          {/* Período Rápido */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Período</label>
            <select
              value={datePeriodOption}
              onChange={(e) => handlePeriodOptionChange(e.target.value as any)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="all">Todos os Registros</option>
              <option value="current_month">Mês Atual (Julho/2026)</option>
              <option value="last_month">Mês Anterior</option>
              <option value="last_30">Últimos 30 Dias</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Data Inicial */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setDatePeriodOption('custom'); }}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Data Final */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setDatePeriodOption('custom'); }}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Categoria */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="all">Todas as Categorias</option>
              {categories.filter(c => c.type === 'despesa').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Fornecedor */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Fornecedor</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="all">Todos os Fornecedores</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Status da Conta</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="all">Todos os Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="atrasado">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="all">Todas as Formas</option>
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Boleto">Boleto Bancário</option>
              <option value="Transferência">Transferência (TED/DOC)</option>
              <option value="Débito Automático">Débito Automático</option>
            </select>
          </div>

          {/* Centro de Custo */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Centro de Custo</label>
            <input
              type="text"
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              placeholder="Ex: Administração, Limpeza..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Busca por Descrição */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Buscar por Descrição</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digitar palavra-chave..."
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '12px', color: '#0F172A', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. SELETOR DOS 10 TIPOS DE RELATÓRIO ── */}
      <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '2px', overflowX: 'auto', display: 'flex', gap: '6px' }}>
        {([
          { key: 'geral', label: '1. Geral de Despesas' },
          { key: 'categoria', label: '2. Por Categoria' },
          { key: 'fornecedor', label: '3. Por Fornecedor' },
          { key: 'status', label: '4. Por Status' },
          { key: 'mensal', label: '5. Relatório Mensal' },
          { key: 'contas_pagar', label: '6. Contas a Pagar' },
          { key: 'contas_pagas', label: '7. Contas Pagas' },
          { key: 'vencidas', label: '8. Despesas Vencidas' },
          { key: 'forma_pagamento', label: '9. Forma de Pagamento' },
          { key: 'centro_custo', label: '10. Centro de Custo' },
        ] as const).map(tab => {
          const isActive = activeReportType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveReportType(tab.key)}
              style={{
                padding: '9px 14px', borderRadius: '8px 8px 0 0', border: 'none',
                backgroundColor: isActive ? '#1E3280' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontSize: '12px', fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── 5. TABELA EXIBIDA CONFORME RELATÓRIO SELECIONADO ── */}
      <div style={{ borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        {/* Table Title Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFBFD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {reportTitles[activeReportType]}
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
              Exibindo resultados com base nos filtros selecionados
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E3280', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '20px' }}>
            {filteredExpenses.length} lançamentos
          </span>
        </div>

        {/* Empty State */}
        {filteredExpenses.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <Search size={22} />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0 }}>
              Nenhum dado encontrado para os filtros selecionados.
            </h4>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, maxWidth: '380px', lineHeight: 1.5 }}>
              Tente alterar os filtros de período, categoria, fornecedor ou clique em "Limpar Filtros" para exibir todos os lançamentos.
            </p>
            <button
              onClick={handleClearFilters}
              style={{ marginTop: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#1E3280', color: '#FFF', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              
              {/* TABLE HEADERS */}
              <thead>
                <tr style={{ backgroundColor: '#1E3280', color: '#FFFFFF' }}>
                  {activeReportType === 'geral' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Descrição</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Categoria</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Fornecedor</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Centro Custo</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Vencimento</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Valor</th>
                    </>
                  )}

                  {activeReportType === 'categoria' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Categoria</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Qtd. Despesas</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pago</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pendente</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Vencido</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Geral</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>% Total</th>
                    </>
                  )}

                  {activeReportType === 'fornecedor' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Fornecedor</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Qtd. Despesas</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pago</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pendente</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Vencido</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Geral</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>% Total</th>
                    </>
                  )}

                  {activeReportType === 'status' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status da Conta</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Quantidade</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Valor Total</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Representatividade (%)</th>
                    </>
                  )}

                  {activeReportType === 'mensal' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Mês / Ano</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Qtd. Lançamentos</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pago</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pendente</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Vencido</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total do Mês</th>
                    </>
                  )}

                  {(activeReportType === 'contas_pagar' || activeReportType === 'contas_pagas' || activeReportType === 'vencidas') && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Descrição</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Categoria</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Fornecedor</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>{activeReportType === 'contas_pagas' ? 'Data Pagamento' : 'Vencimento'}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>{activeReportType === 'contas_pagas' ? 'Forma Pagamento' : 'Situação do Prazo'}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Valor</th>
                    </>
                  )}

                  {activeReportType === 'forma_pagamento' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Forma de Pagamento</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Quantidade</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Valor Total</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Representatividade (%)</th>
                    </>
                  )}

                  {activeReportType === 'centro_custo' && (
                    <>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Centro de Custo</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Qtd. Despesas</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pago</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Pendente</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Vencido</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Geral</th>
                    </>
                  )}
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                
                {/* 1. GERAL */}
                {activeReportType === 'geral' && filteredExpenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{e.description}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{categoriesMap.get(e.categoryId) || 'Sem categoria'}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{e.supplier || 'Sem fornecedor'}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{e.costCenter || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDateBR(e.dueDate)}</td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(e.status)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: e.status === 'cancelado' ? '#94A3B8' : '#0F172A' }}>{formatBRL(e.amount)}</td>
                  </tr>
                ))}

                {/* 2. CATEGORIA */}
                {activeReportType === 'categoria' && categoryData.map(c => (
                  <tr key={c.categoryId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{c.categoryName}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{c.count}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16A34A', fontWeight: 600 }}>{formatBRL(c.totalPaid)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{formatBRL(c.totalPending)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>{formatBRL(c.totalOverdue)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(c.totalAmount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>{c.percentage.toFixed(1)}%</td>
                  </tr>
                ))}

                {/* 3. FORNECEDOR */}
                {activeReportType === 'fornecedor' && supplierData.map(s => (
                  <tr key={s.supplierName} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{s.supplierName}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{s.count}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16A34A', fontWeight: 600 }}>{formatBRL(s.totalPaid)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{formatBRL(s.totalPending)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>{formatBRL(s.totalOverdue)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(s.totalAmount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>{s.percentage.toFixed(1)}%</td>
                  </tr>
                ))}

                {/* 4. STATUS */}
                {activeReportType === 'status' && statusData.map(s => (
                  <tr key={s.status} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(s.status)} <span style={{ marginLeft: '8px', fontWeight: 700 }}>{s.label}</span></td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{s.count}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(s.totalAmount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>{s.percentage.toFixed(1)}%</td>
                  </tr>
                ))}

                {/* 5. MENSAL */}
                {activeReportType === 'mensal' && monthlyData.map(m => (
                  <tr key={m.monthKey} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1E3280' }}>{m.monthLabel}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{m.count}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16A34A', fontWeight: 600 }}>{formatBRL(m.totalPaid)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{formatBRL(m.totalPending)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>{formatBRL(m.totalOverdue)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(m.totalExpenses)}</td>
                  </tr>
                ))}

                {/* 6, 7, 8. CONTAS PAGAR / PAGAS / VENCIDAS */}
                {(activeReportType === 'contas_pagar' || activeReportType === 'contas_pagas' || activeReportType === 'vencidas') && (
                  (activeReportType === 'contas_pagas' ? payablesPaidData : activeReportType === 'vencidas' ? payablesOverdueData : payablesAllData).map(item => {
                    const e = item.expense;
                    const termStatus = item.isOverdue ? `${Math.abs(item.daysDiff)} dia(s) em atraso` : item.daysDiff === 0 ? 'Vence hoje' : `Vence em ${item.daysDiff} dia(s)`;
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{e.description}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{categoriesMap.get(e.categoryId) || 'Sem categoria'}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{e.supplier || 'Sem fornecedor'}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDateBR(activeReportType === 'contas_pagas' ? e.paymentDate : e.dueDate)}</td>
                        <td style={{ padding: '12px 16px', color: item.isOverdue ? '#DC2626' : '#475569', fontWeight: item.isOverdue ? 700 : 500 }}>
                          {activeReportType === 'contas_pagas' ? (e.paymentMethod || '—') : termStatus}
                        </td>
                        <td style={{ padding: '12px 16px' }}>{getStatusBadge(e.status)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(e.amount)}</td>
                      </tr>
                    );
                  })
                )}

                {/* 9. FORMA PAGAMENTO */}
                {activeReportType === 'forma_pagamento' && paymentMethodData.map(p => (
                  <tr key={p.method} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{p.method}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{p.count}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(p.totalAmount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>{p.percentage.toFixed(1)}%</td>
                  </tr>
                ))}

                {/* 10. CENTRO DE CUSTO */}
                {activeReportType === 'centro_custo' && costCenterData.map(cc => (
                  <tr key={cc.costCenterName} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{cc.costCenterName}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{cc.count}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16A34A', fontWeight: 600 }}>{formatBRL(cc.totalPaid)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{formatBRL(cc.totalPending)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>{formatBRL(cc.totalOverdue)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{formatBRL(cc.totalAmount)}</td>
                  </tr>
                ))}

              </tbody>

              {/* TABLE FOOTER / TOTALS */}
              <tfoot>
                <tr style={{ backgroundColor: '#FAFBFD', borderTop: '2px solid #1E3280' }}>
                  <td colSpan={2} style={{ padding: '14px 16px', fontWeight: 800, color: '#0F172A' }}>
                    TOTALIZADOR GERAL ({filteredExpenses.filter(e => e.status !== 'cancelado').length} lançamentos)
                  </td>
                  <td colSpan={activeReportType === 'geral' || activeReportType === 'contas_pagar' || activeReportType === 'contas_pagas' || activeReportType === 'vencidas' ? 4 : activeReportType === 'status' || activeReportType === 'forma_pagamento' ? 1 : 4}></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, fontSize: '14px', color: '#1E3280' }}>
                    {formatBRL(kpis.totalAmount)}
                  </td>
                  {activeReportType === 'categoria' || activeReportType === 'fornecedor' || activeReportType === 'centro_custo' ? <td /> : null}
                </tr>
              </tfoot>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}
