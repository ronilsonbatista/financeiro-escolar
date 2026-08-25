"use client";

import React, { useState, useMemo } from 'react';
import { Expense, Category, Supplier, TransactionStatus } from '@/types/financial';
import CurrencyValue from '@/components/CurrencyValue';
import LayoutModeToggle from './LayoutModeToggle';
import {
  Sparkles, DollarSign, CheckCircle2, Clock, AlertTriangle, FolderOpen,
  TrendingUp, TrendingDown, ArrowUpRight, PlusCircle, BarChart3, FilterX,
  Calendar, CheckSquare, Edit2, Trash2, Tag, Truck, ShieldAlert, Layers,
  ChevronRight, ArrowRight, Wallet, PieChart, RefreshCw, FileText
} from 'lucide-react';

interface DashboardModernProps {
  expenses: Expense[];
  categories: Category[];
  suppliers: Supplier[];
  onOpenExpenseForm: () => void;
  onOpenIncomeForm: () => void;
  onNavigateTab: (tab: string) => void;
  onEditTrigger: (id: string, type: 'despesa' | 'receita') => void;
  onDeleteTrigger: (id: string, type: 'despesa' | 'receita') => void;
  onPayTrigger: (id: string) => void;
  formatDate: (dateStr: string) => string;
}

export default function DashboardModern({
  expenses,
  categories,
  suppliers,
  onOpenExpenseForm,
  onOpenIncomeForm,
  onNavigateTab,
  onEditTrigger,
  onDeleteTrigger,
  onPayTrigger,
  formatDate
}: DashboardModernProps) {
  // Local Filter Period
  const [periodOption, setPeriodOption] = useState<'current_month' | 'last_month' | 'last_30' | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTime = new Date(todayStr).getTime();

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (e.status === 'cancelado') return false;

      // Status Filter
      if (selectedStatusFilter !== 'all' && e.status !== selectedStatusFilter) return false;

      // Category Filter
      if (selectedCategoryFilter !== 'all' && e.categoryId !== selectedCategoryFilter) return false;

      // Period Filter
      if (periodOption === 'current_month') {
        const y = new Date().getFullYear();
        const m = String(new Date().getMonth() + 1).padStart(2, '0');
        if (!e.dueDate.startsWith(`${y}-${m}`)) return false;
      } else if (periodOption === 'last_month') {
        const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const y = prev.getFullYear();
        const m = String(prev.getMonth() + 1).padStart(2, '0');
        if (!e.dueDate.startsWith(`${y}-${m}`)) return false;
      } else if (periodOption === 'last_30') {
        const past30 = new Date(todayTime - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        if (e.dueDate < past30 || e.dueDate > todayStr) return false;
      }

      return true;
    });
  }, [expenses, periodOption, selectedStatusFilter, selectedCategoryFilter, todayTime, todayStr]);

  // Key KPI Calculations
  const metrics = useMemo(() => {
    const active = filteredExpenses;
    const countTotal = active.length;

    let totalAmount = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let highestExpense: Expense | null = null;

    const catMap = new Map<string, number>();
    const supMap = new Map<string, number>();
    const methodMap = new Map<string, number>();

    const upcoming7Days: { expense: Expense; daysDiff: number }[] = [];
    const overdueList: { expense: Expense; daysDiff: number }[] = [];

    active.forEach(e => {
      totalAmount += e.amount;

      if (e.status === 'pago') totalPaid += e.amount;
      else if (e.status === 'pendente') totalPending += e.amount;
      else if (e.status === 'atrasado') totalOverdue += e.amount;

      if (!highestExpense || e.amount > highestExpense.amount) {
        highestExpense = e;
      }

      // Cat Map
      const catName = categories.find(c => c.id === e.categoryId)?.name || 'Sem categoria';
      catMap.set(catName, (catMap.get(catName) || 0) + e.amount);

      // Sup Map
      const supName = e.supplier?.trim() || 'Sem fornecedor';
      supMap.set(supName, (supMap.get(supName) || 0) + e.amount);

      // Method Map
      const method = e.paymentMethod || 'Não informada';
      methodMap.set(method, (methodMap.get(method) || 0) + e.amount);

      // Due date calculations
      const dueTime = new Date(e.dueDate).getTime();
      const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));

      if (e.status === 'atrasado' || (e.status === 'pendente' && diffDays < 0)) {
        overdueList.push({ expense: e, daysDiff: diffDays });
      } else if (e.status === 'pendente' && diffDays >= 0 && diffDays <= 7) {
        upcoming7Days.push({ expense: e, daysDiff: diffDays });
      }
    });

    const averageAmount = countTotal > 0 ? totalAmount / countTotal : 0;

    let topCatName = 'Nenhuma';
    let maxCatVal = 0;
    catMap.forEach((val, name) => {
      if (val > maxCatVal) {
        maxCatVal = val;
        topCatName = name;
      }
    });

    let topSupName = 'Nenhum';
    let maxSupVal = 0;
    supMap.forEach((val, name) => {
      if (val > maxSupVal) {
        maxSupVal = val;
        topSupName = name;
      }
    });

    // Untagged counts
    const untaggedSupplierCount = active.filter(e => !e.supplier || !e.supplier.trim()).length;
    const untaggedCategoryCount = active.filter(e => !e.categoryId || e.categoryId === 'uncategorized').length;

    // Top 5 Suppliers Ranked
    const topSuppliersRanked = Array.from(supMap.entries())
      .map(([name, amount]) => ({ name, amount, percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top Categories Ranked
    const topCategoriesRanked = Array.from(catMap.entries())
      .map(([name, amount]) => {
        const catObj = categories.find(c => c.name === name);
        return {
          name,
          amount,
          color: catObj?.color || 'blue',
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      totalAmount,
      totalPaid,
      totalPending,
      totalOverdue,
      countTotal,
      averageAmount,
      highestExpense,
      topCatName,
      topSupName,
      upcoming7Days: upcoming7Days.sort((a, b) => a.daysDiff - b.daysDiff),
      overdueList: overdueList.sort((a, b) => a.daysDiff - b.daysDiff),
      untaggedSupplierCount,
      untaggedCategoryCount,
      topSuppliersRanked,
      topCategoriesRanked,
    };
  }, [filteredExpenses, categories, todayTime]);

  // Recent 6 Expenses
  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => (b.createdAt || b.dueDate).localeCompare(a.createdAt || a.dueDate))
      .slice(0, 6);
  }, [filteredExpenses]);

  // Largest 5 Expenses
  const largestExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredExpenses]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const categoriesMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* ── 1. CAMEÇALHO EXECUTIVO E CONTROLES ── */}
      <div style={{ padding: '24px 28px', borderRadius: '16px', background: 'linear-gradient(135deg, #1E3280 0%, #0F172A 100%)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(30,50,128,0.2)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow circle */}
        <div style={{ position: 'absolute', right: '-80px', top: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }} className="lg:flex-row lg:items-center lg:justify-between">
          
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.3)', color: '#F59E0B', fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>
              <Sparkles size={13} /> Visão Geral Financeira · Painel Executivo
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              Centro Educacional Batista Sobrinho
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0', fontWeight: 500 }}>
              Acompanhamento inteligente de despesas, saldos, pagamentos e fornecedores em tempo real.
            </p>
          </div>

          {/* Action & Toggle Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Filter Period Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Calendar size={14} color="#CBD5E1" />
              <select
                value={periodOption}
                onChange={(e) => setPeriodOption(e.target.value as any)}
                style={{ backgroundColor: 'transparent', color: '#FFFFFF', border: 'none', outline: 'none', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <option value="all" style={{ color: '#0F172A' }}>Todos os Períodos</option>
                <option value="current_month" style={{ color: '#0F172A' }}>Mês Atual (Julho/2026)</option>
                <option value="last_month" style={{ color: '#0F172A' }}>Mês Anterior</option>
                <option value="last_30" style={{ color: '#0F172A' }}>Últimos 30 Dias</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <LayoutModeToggle />

            {/* New Expense Button */}
            <button
              onClick={onOpenExpenseForm}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', backgroundColor: '#D97706', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,119,6,0.3)', transition: 'transform 0.15s' }}
            >
              <PlusCircle size={15} />
              <span>Nova Despesa</span>
            </button>

          </div>

        </div>

      </div>

      {/* ── 2. GRID DE CARDS EXECUTIVOS (10 Métricas) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        
        {/* Total Despesas */}
        <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Despesas</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB' }}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{formatBRL(metrics.totalAmount)}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '6px' }}>{metrics.countTotal} lançamentos ativos</span>
        </div>

        {/* Total Pago */}
        <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pago</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A' }}><CheckCircle2 size={16} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D', letterSpacing: '-0.02em' }}>{formatBRL(metrics.totalPaid)}</div>
          <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginTop: '6px' }}>
            {metrics.totalAmount > 0 ? `${((metrics.totalPaid / metrics.totalAmount) * 100).toFixed(1)}% das despesas` : '0%'}
          </span>
        </div>

        {/* Total Pendente */}
        <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pendente</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#FFFBEB', color: '#D97706' }}><Clock size={16} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#B45309', letterSpacing: '-0.02em' }}>{formatBRL(metrics.totalPending)}</div>
          <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 500, marginTop: '6px' }}>A vencer dentro do prazo</span>
        </div>

        {/* Total Vencido */}
        <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #FECACA', boxShadow: '0 2px 6px rgba(220,38,38,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Vencido</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626' }}><AlertTriangle size={16} /></div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#B91C1C', letterSpacing: '-0.02em' }}>{formatBRL(metrics.totalOverdue)}</div>
          <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: 700, marginTop: '6px' }}>{metrics.overdueList.length} conta(s) em atraso</span>
        </div>

        {/* Ticket Médio */}
        <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Médio</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F1F5F9', color: '#475569' }}><PieChart size={16} /></div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{formatBRL(metrics.averageAmount)}</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '6px' }}>Por lançamento</span>
        </div>

      </div>

      {/* ── 3. PAINEL VISUAL DE GRÁFICOS E ANÁLISES DE IMPACTO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Gráfico 1: Distribuição por Status */}
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Distribuição por Status</h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Proporção de contas pagas, pendentes e vencidas</p>
            </div>
            <BarChart3 size={18} color="#1E3280" />
          </div>

          {/* Custom Donut / Segment Bar Visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ height: '28px', borderRadius: '8px', overflow: 'hidden', display: 'flex', backgroundColor: '#F1F5F9', width: '100%', border: '1px solid #E2E8F0' }}>
              {metrics.totalAmount > 0 ? (
                <>
                  {metrics.totalPaid > 0 && (
                    <div style={{ width: `${(metrics.totalPaid / metrics.totalAmount) * 100}%`, backgroundColor: '#16A34A', transition: 'all 0.4s ease' }} title={`Pago: ${formatBRL(metrics.totalPaid)}`} />
                  )}
                  {metrics.totalPending > 0 && (
                    <div style={{ width: `${(metrics.totalPending / metrics.totalAmount) * 100}%`, backgroundColor: '#D97706', transition: 'all 0.4s ease' }} title={`Pendente: ${formatBRL(metrics.totalPending)}`} />
                  )}
                  {metrics.totalOverdue > 0 && (
                    <div style={{ width: `${(metrics.totalOverdue / metrics.totalAmount) * 100}%`, backgroundColor: '#DC2626', transition: 'all 0.4s ease' }} title={`Vencido: ${formatBRL(metrics.totalOverdue)}`} />
                  )}
                </>
              ) : (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '12px' }}>Sem dados para exibir</div>
              )}
            </div>

            {/* Legend Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ padding: '10px 8px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700, display: 'block' }}>Pago</span>
                <span style={{ fontSize: '13px', color: '#15803D', fontWeight: 800 }}>{formatBRL(metrics.totalPaid)}</span>
              </div>
              <div style={{ padding: '10px 8px', borderRadius: '10px', backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                <span style={{ fontSize: '10px', color: '#92400E', fontWeight: 700, display: 'block' }}>Pendente</span>
                <span style={{ fontSize: '13px', color: '#B45309', fontWeight: 800 }}>{formatBRL(metrics.totalPending)}</span>
              </div>
              <div style={{ padding: '10px 8px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                <span style={{ fontSize: '10px', color: '#991B1B', fontWeight: 700, display: 'block' }}>Vencido</span>
                <span style={{ fontSize: '13px', color: '#B91C1C', fontWeight: 800 }}>{formatBRL(metrics.totalOverdue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Despesas por Categoria (Ranking de Gastos) */}
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Despesas por Categoria</h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Principais áreas de consumo orçamentário</p>
            </div>
            <Tag size={18} color="#D97706" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px', overflowY: 'auto' }}>
            {metrics.topCategoriesRanked.map((cat, idx) => (
              <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{cat.name}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {formatBRL(cat.amount)} <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({cat.percentage.toFixed(0)}%)</span>
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: idx === 0 ? '#1E3280' : idx === 1 ? '#D97706' : '#2563EB', borderRadius: '4px', transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}

            {metrics.topCategoriesRanked.length === 0 && (
              <div style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>Sem categorias lançadas</div>
            )}
          </div>
        </div>

        {/* Gráfico 3: Top 5 Fornecedores */}
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Top 5 Fornecedores</h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Fornecedores com maior volume financeiro</p>
            </div>
            <Truck size={18} color="#2563EB" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics.topSuppliersRanked.map((sup, idx) => (
              <div key={sup.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#1E3280', color: '#FFF', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{sup.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{formatBRL(sup.amount)}</span>
              </div>
            ))}

            {metrics.topSuppliersRanked.length === 0 && (
              <div style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>Sem fornecedores cadastrados</div>
            )}
          </div>
        </div>

      </div>

      {/* ── 4. BLOCOS DE ALERTA E RISCOS DO MÊS ── */}
      {(metrics.overdueList.length > 0 || metrics.upcoming7Days.length > 0 || metrics.untaggedSupplierCount > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          
          {/* Alerta de Contas Vencidas */}
          {metrics.overdueList.length > 0 && (
            <div style={{ padding: '18px 22px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 800, fontSize: '13px' }}>
                <ShieldAlert size={18} color="#DC2626" />
                <span>Atenção: {metrics.overdueList.length} despesa(s) vencida(s)</span>
              </div>
              <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                Existem parcelas em atraso que exigem liquidação para evitar juros ou corte de fornecimento.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {metrics.overdueList.slice(0, 3).map(item => (
                  <div key={item.expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #FEE2E2', fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.expense.description}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#DC2626' }}>{formatBRL(item.expense.amount)}</span>
                      <button onClick={() => onPayTrigger(item.expense.id)} style={{ padding: '3px 6px', borderRadius: '4px', backgroundColor: '#16A34A', color: '#FFF', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Pagar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vencendo em 7 Dias */}
          {metrics.upcoming7Days.length > 0 && (
            <div style={{ padding: '18px 22px', borderRadius: '14px', backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 800, fontSize: '13px' }}>
                <Clock size={18} color="#D97706" />
                <span>Próximos Vencimentos: {metrics.upcoming7Days.length} conta(s) nos próximos 7 dias</span>
              </div>
              <p style={{ fontSize: '12px', color: '#B45309', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                Acompanhe as datas para fluxo de caixa da escola sem imprevistos.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {metrics.upcoming7Days.slice(0, 3).map(item => (
                  <div key={item.expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #FEF3C7', fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.expense.description}</span>
                    <span style={{ fontWeight: 700, color: '#D97706' }}>{formatBRL(item.expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── 5. TABELAS RESUMIDAS E FEED DE ATIVIDADES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Bloco 1: Últimas Despesas Lançadas */}
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Últimas Despesas Lançadas</h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Lançamentos mais recentes no livro caixa</p>
            </div>
            <button onClick={() => onNavigateTab('expenses')} style={{ fontSize: '12px', fontWeight: 700, color: '#1E3280', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todas <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                  <th style={{ padding: '8px 10px' }}>Descrição</th>
                  <th style={{ padding: '8px 10px' }}>Vencimento</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{e.description}</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>{e.supplier || 'Sem fornecedor'}</div>
                    </td>
                    <td style={{ padding: '10px', color: '#475569' }}>{formatDate(e.dueDate)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>{formatBRL(e.amount)}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        {e.status === 'pendente' || e.status === 'atrasado' ? (
                          <button onClick={() => onPayTrigger(e.id)} title="Pagar" style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#F0FDF4', color: '#16A34A', border: 'none', cursor: 'pointer' }}>
                            <CheckSquare size={13} />
                          </button>
                        ) : null}
                        <button onClick={() => onEditTrigger(e.id, 'despesa')} title="Editar" style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {recentExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Nenhuma despesa para exibir</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloco 2: Maiores Despesas do Período */}
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Maiores Despesas do Período</h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Contas com maior impacto financeiro</p>
            </div>
            <button onClick={() => onNavigateTab('reports')} style={{ fontSize: '12px', fontWeight: 700, color: '#1E3280', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Relatório Completo <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {largestExpenses.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{e.description}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {categoriesMap.get(e.categoryId) || 'Sem categoria'} · {e.supplier || 'Sem fornecedor'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E3280' }}>{formatBRL(e.amount)}</div>
                  <span style={{ fontSize: '10px', color: e.status === 'pago' ? '#16A34A' : e.status === 'atrasado' ? '#DC2626' : '#D97706', fontWeight: 700 }}>
                    {e.status === 'pago' ? 'Pago' : e.status === 'atrasado' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}

            {largestExpenses.length === 0 && (
              <div style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>Sem lançamentos no período</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
