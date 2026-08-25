"use client";

import React from 'react';
import { Expense, Category, TransactionStatus } from '@/types/financial';
import CurrencyValue from '@/components/CurrencyValue';
import {
  DollarSign, CheckCircle2, Clock, AlertTriangle, FolderOpen, Scale, Tag, Trash2, Edit2, CheckSquare
} from 'lucide-react';

interface DashboardClassicProps {
  cardsData: {
    totalExpenses: number;
    paidExpenses: number;
    pendingExpenses: number;
    overdueExpenses: number;
    countExpenses: number;
    grossRevenue: number;
    countIncomes: number;
  };
  payablesStats: {
    totalToPay: number;
    countPending: number;
    totalOverdue: number;
    countOverdue: number;
  };
  monthlyEvolution: { label: string; value: number }[];
  categories: Category[];
  processedExpenses: Expense[];
  latestExpenses: Expense[];
  quickFilter: 'all' | 'payables';
  showRevenueSummary: boolean;
  setShowRevenueSummary: (val: boolean) => void;
  setActiveTab: (tab: any) => void;
  onEditTrigger: (id: string, type: 'despesa' | 'receita') => void;
  onDeleteTrigger: (id: string, type: 'despesa' | 'receita') => void;
  onPayTrigger: (id: string) => void;
  onViewDetails: (id: string, type: 'despesa' | 'receita') => void;
  formatDate: (dateStr: string) => string;
  getStatusBadgeClass: (status: TransactionStatus) => string;
  getStatusLabel: (status: TransactionStatus) => string;
}

export default function DashboardClassic({
  cardsData,
  payablesStats,
  monthlyEvolution,
  categories,
  processedExpenses,
  latestExpenses,
  quickFilter,
  showRevenueSummary,
  setShowRevenueSummary,
  setActiveTab,
  onEditTrigger,
  onDeleteTrigger,
  onPayTrigger,
  onViewDetails,
  formatDate,
  getStatusBadgeClass,
  getStatusLabel
}: DashboardClassicProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px' }}>

      {/* Header section with toggle option */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Indicadores Gerais</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
          <input type="checkbox" checked={showRevenueSummary} onChange={(e) => setShowRevenueSummary(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#1E3280', cursor: 'pointer' }} />
          Mostrar Receitas e Saldo de Caixa
        </label>
      </div>

      {/* Payables banner (when quick filter payables is active) */}
      {quickFilter === 'payables' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', padding: '18px 22px', backgroundColor: '#FFFBEF', borderRadius: '12px', border: '1px solid rgba(185,137,28,0.2)' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>A Pagar no Prazo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock style={{ width: '16px', height: '16px', color: '#B9891C', flexShrink: 0 }} /><CurrencyValue value={-payablesStats.totalToPay} colorType="neutral" size="lg" /></div>
            <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>{payablesStats.countPending} conta(s)</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Em Atraso</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle style={{ width: '16px', height: '16px', color: '#B94A48', flexShrink: 0 }} /><CurrencyValue value={-payablesStats.totalOverdue} colorType="negative" size="lg" /></div>
            <p style={{ fontSize: '10px', color: '#B94A48', marginTop: '4px' }}>{payablesStats.countOverdue} vencida(s)</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Saldo Caixa</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Scale style={{ width: '16px', height: '16px', color: '#2E7D57', flexShrink: 0 }} /><CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="lg" /></div>
            <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>Receitas - Pagas</p>
          </div>
        </div>
      )}

      {/* ── 5 Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Total Despesas */}
        <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Total Despesas</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
            </div>
          </div>
          <div>
            <CurrencyValue value={-cardsData.totalExpenses} colorType="neutral" size="2xl" />
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>Lançadas no período</p>
          </div>
        </div>

        {/* Pago */}
        <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Total Pago</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#EAF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2E7D57' }} />
            </div>
          </div>
          <div>
            <CurrencyValue value={-cardsData.paidExpenses} colorType="positive" size="2xl" />
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>Contas liquidadas</p>
          </div>
        </div>

        {/* Pendente */}
        <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Pendente</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '14px', height: '14px', color: '#B9891C' }} />
            </div>
          </div>
          <div>
            <CurrencyValue value={-cardsData.pendingExpenses} colorType="neutral" size="2xl" />
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>A vencer no prazo</p>
          </div>
        </div>

        {/* Vencido */}
        <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid #B94A48' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Vencido</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FDF3F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle style={{ width: '14px', height: '14px', color: '#B94A48' }} />
            </div>
          </div>
          <div>
            <CurrencyValue value={-cardsData.overdueExpenses} colorType="negative" size="2xl" />
            <p style={{ fontSize: '11px', color: '#B94A48', marginTop: '5px', fontWeight: 500 }}>Contas atrasadas</p>
          </div>
        </div>

        {/* Lançamentos */}
        <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Lançamentos</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: 'rgba(30,50,128,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen style={{ width: '14px', height: '14px', color: '#1E3280' }} />
            </div>
          </div>
          <div>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#1E3280', lineHeight: 1.1, display: 'block' }}>{cardsData.countExpenses}</span>
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px', fontWeight: 500 }}>{cardsData.countExpenses === 1 ? '1 despesa' : `${cardsData.countExpenses} despesas`}</p>
          </div>
        </div>
      </div>

      {/* Revenue cards (conditional) */}
      {showRevenueSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" style={{ animation: 'cebsFadeIn 0.2s ease forwards' }}>
          <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Receita Bruta do Mês</span>
            <CurrencyValue value={cardsData.grossRevenue} colorType="positive" size="2xl" />
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{cardsData.countIncomes} recebimento(s)</p>
          </div>
          <div className="cebs-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Resultado Líquido</span>
            <CurrencyValue value={cardsData.grossRevenue - cardsData.paidExpenses} colorType="auto" size="2xl" />
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Balanço (Receitas − Despesas Pagas)</p>
          </div>
        </div>
      )}

      {/* ── CHARTS SECTION (2 columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">

        {/* Evolution & Status distribution */}
        <div className="cebs-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Status distribution bar */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Distribuição de Gastos por Status</h4>
            
            {/* Horizontal Segmented Bar */}
            <div style={{ height: '24px', borderRadius: '6px', overflow: 'hidden', display: 'flex', backgroundColor: '#E5E7EB', width: '100%', marginBottom: '14px' }}>
              {cardsData.totalExpenses > 0 ? (
                <>
                  {cardsData.paidExpenses > 0 && (
                    <div
                      style={{ width: `${(cardsData.paidExpenses / cardsData.totalExpenses) * 100}%`, backgroundColor: '#2E7D57', transition: 'all 0.3s' }}
                      title={`Pago: ${((cardsData.paidExpenses / cardsData.totalExpenses) * 100).toFixed(0)}%`}
                    />
                  )}
                  {cardsData.pendingExpenses > 0 && (
                    <div
                      style={{ width: `${(cardsData.pendingExpenses / cardsData.totalExpenses) * 100}%`, backgroundColor: '#B9891C', transition: 'all 0.3s' }}
                      title={`Pendente: ${((cardsData.pendingExpenses / cardsData.totalExpenses) * 100).toFixed(0)}%`}
                    />
                  )}
                  {cardsData.overdueExpenses > 0 && (
                    <div
                      style={{ width: `${(cardsData.overdueExpenses / cardsData.totalExpenses) * 100}%`, backgroundColor: '#B94A48', transition: 'all 0.3s' }}
                      title={`Vencido: ${((cardsData.overdueExpenses / cardsData.totalExpenses) * 100).toFixed(0)}%`}
                    />
                  )}
                </>
              ) : (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '11px', fontWeight: 500 }}>Nenhuma despesa para exibir no período</div>
              )}
            </div>

            {/* Chart Legends */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2E7D57' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2E7D57' }} />
                Pago ({cardsData.totalExpenses > 0 ? ((cardsData.paidExpenses / cardsData.totalExpenses) * 100).toFixed(0) : 0}%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#B9891C' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#B9891C' }} />
                Pendente ({cardsData.totalExpenses > 0 ? ((cardsData.pendingExpenses / cardsData.totalExpenses) * 100).toFixed(0) : 0}%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#B94A48' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#B94A48' }} />
                Vencido ({cardsData.totalExpenses > 0 ? ((cardsData.overdueExpenses / cardsData.totalExpenses) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: '#E5E7EB' }} />

          {/* Monthly Evolution Block */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Evolução Mensal das Despesas</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', padding: '10px 0 5px', borderBottom: '1.5px solid #E5E7EB' }}>
              {monthlyEvolution.map(m => {
                const maxVal = Math.max(...monthlyEvolution.map(x => x.value), 1000);
                const pctHeight = (m.value / maxVal) * 100;
                return (
                  <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#374151' }}>R$ {m.value.toFixed(0)}</span>
                    
                    <div
                      style={{
                        width: '32px',
                        height: `${Math.max(pctHeight, 4)}px`,
                        backgroundColor: m.value > 0 ? '#1E3280' : '#E5E7EB',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease'
                      }}
                    />
                    
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Resumo por categoria */}
        <div className="cebs-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gastos por Categoria</h4>
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Distribuição das despesas do período</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '270px', overflowY: 'auto', paddingRight: '4px' }}>
            {categories.filter(c => c.type === 'despesa' && c.active).map(cat => {
              const amount = processedExpenses.filter(e => e.categoryId === cat.id && e.status !== 'cancelado').reduce((sum, e) => sum + e.amount, 0);
              const percentage = cardsData.totalExpenses > 0 ? (amount / cardsData.totalExpenses) * 100 : 0;
              if (amount === 0) return null;
              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600 }}>
                    <span style={{ color: '#4B5563' }}>{cat.name}</span>
                    <span style={{ color: '#111827' }}>R$ {amount.toFixed(2)} <span style={{ color: '#9CA3AF', fontSize: '10px', marginLeft: '2px' }}>({percentage.toFixed(0)}%)</span></span>
                  </div>
                  
                  <div style={{ height: '6px', borderRadius: '99px', backgroundColor: '#F3F4F6', width: '100%', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: `var(--color-${cat.color}-primary, #1E3280)`,
                        borderRadius: '99px'
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {categories.filter(c => c.type === 'despesa').every(cat => processedExpenses.filter(e => e.categoryId === cat.id && e.status !== 'cancelado').reduce((s, e) => s + e.amount, 0) === 0) && (
              <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>Nenhuma despesa registrada para as categorias ativas.</p>
            )}
          </div>
        </div>

      </div>

      {/* ── LATEST EXPENSES BLOCK ── */}
      <div className="cebs-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Últimas Despesas Lançadas</h4>
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Atividade financeira recente</p>
          </div>
          <button onClick={() => setActiveTab('expenses')} style={{ fontSize: '12px', color: '#1E3280', fontWeight: 700, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>Ver todo o livro →</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #F3F4F6', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '10px 12px' }}>Descrição</th>
                <th style={{ padding: '10px 12px' }}>Categoria</th>
                <th style={{ padding: '10px 12px' }}>Vencimento</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Valor</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
              {latestExpenses.map(exp => {
                const catObj = categories.find(c => c.id === exp.categoryId);
                return (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #F9FAFB', transition: 'background-color 0.15s' }} className="hover:bg-slate-50">
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{exp.description}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{exp.supplier || 'Sem fornecedor'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563' }}>
                        <Tag style={{ width: '12px', height: '12px', color: '#1E3280' }} />
                        {catObj ? catObj.name : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#6B7280' }}>{formatDate(exp.dueDate)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                      <CurrencyValue value={-exp.amount} colorType="neutral" size="sm" />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusBadgeClass(exp.status)}`}>
                        {getStatusLabel(exp.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {exp.status === 'pendente' || exp.status === 'atrasado' ? (
                          <button onClick={() => onPayTrigger(exp.id)} title="Dar Baixa (Pagar)" style={{ padding: '5px', borderRadius: '5px', border: 'none', backgroundColor: '#EAF5F0', color: '#2E7D57', cursor: 'pointer' }}>
                            <CheckSquare style={{ width: '13px', height: '13px' }} />
                          </button>
                        ) : null}
                        <button onClick={() => onEditTrigger(exp.id, 'despesa')} title="Editar" style={{ padding: '5px', borderRadius: '5px', border: 'none', backgroundColor: '#F3F4F6', color: '#4B5563', cursor: 'pointer' }}>
                          <Edit2 style={{ width: '13px', height: '13px' }} />
                        </button>
                        <button onClick={() => onDeleteTrigger(exp.id, 'despesa')} title="Excluir" style={{ padding: '5px', borderRadius: '5px', border: 'none', backgroundColor: '#FDF3F3', color: '#B94A48', cursor: 'pointer' }}>
                          <Trash2 style={{ width: '13px', height: '13px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {latestExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>
                    Nenhuma despesa lançada para a seleção atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
