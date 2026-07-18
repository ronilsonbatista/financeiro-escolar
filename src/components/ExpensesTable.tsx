import React from 'react';
import { Expense, Income, Category, TransactionStatus } from '@/types/financial';
import {
  Check, Edit2, Trash2, Eye, HelpCircle, ArrowUpRight, ArrowDownRight,
  TrendingDown, PlusCircle, AlertCircle, FileText
} from 'lucide-react';
import * as Icons from 'lucide-react';
import StatusBadge from './StatusBadge';
import CurrencyValue from './CurrencyValue';

interface ExpensesTableProps {
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  mode: 'despesa' | 'receita';
  onPay: (id: string) => void;
  onEdit: (id: string, type: 'despesa' | 'receita') => void;
  onDelete: (id: string, type: 'despesa' | 'receita') => void;
  onViewDetails: (id: string, type: 'despesa' | 'receita') => void;
  onClearFilter?: () => void;
  isMonthClosed?: boolean;
  onTriggerAdd?: () => void;
}

export default function ExpensesTable({
  categories,
  expenses,
  incomes,
  mode,
  onPay,
  onEdit,
  onDelete,
  onViewDetails,
  onClearFilter,
  isMonthClosed = false,
  onTriggerAdd,
}: ExpensesTableProps) {
  
  // Format Date (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper to fetch Category style configurations
  const getCategoryDetails = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    const LucideIcon = found ? ((Icons as any)[found.icon] || HelpCircle) : HelpCircle;
    
    if (found) {
      return {
        name: found.name,
        badgeBg: `bg-white`,
        textColor: `text-slate-900`,
        borderColor: `border-[#E6E1D6]`,
        iconBg: `var(--color-${found.color}-dark, #EAF2FF)`,
        iconColor: `var(--color-${found.color}-primary, #173B72)`,
        Icon: LucideIcon,
        colorKey: found.color,
      };
    }

    return {
      name: 'Outros',
      badgeBg: 'bg-white',
      textColor: 'text-slate-500',
      borderColor: 'border-[#E6E1D6]',
      iconBg: '#EAF2FF',
      iconColor: '#173B72',
      Icon: LucideIcon,
      colorKey: 'zinc',
    };
  };

  // Switch Lists
  const listEmpty = mode === 'despesa' ? expenses.length === 0 : incomes.length === 0;

  // Custom Empty States (Roomier)
  if (listEmpty) {
    const isFiltered = !!onClearFilter;
    
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center rounded-xl border border-[rgba(22,23,15,0.08)] bg-[#FFFDF7] min-h-[380px] shadow-xs transition-all font-sans">
        <div className="p-5 rounded-full bg-[#F6F1E8] text-[#5C5E54] border border-[rgba(22,23,15,0.04)] mb-5">
          <FileText className="w-10 h-10" />
        </div>
        
        {isFiltered ? (
          <>
            <h4 className="text-base font-bold text-[#16170F] font-title">Nenhum resultado encontrado</h4>
            <p className="text-xs text-[#5C5E54] max-w-sm mt-2 mb-8 font-semibold leading-relaxed">
              Não existem registros de {mode === 'despesa' ? 'despesas' : 'receitas'} correspondentes aos filtros selecionados.
            </p>
            <button
              onClick={onClearFilter}
              className="px-5 py-3 text-xs font-bold rounded-lg border border-[rgba(22,23,15,0.15)] bg-[#FFFDF7] text-[#16170F] hover:bg-[#F6F1E8] transition-all shadow-xs cursor-pointer"
            >
              Limpar Filtros Ativos
            </button>
          </>
        ) : (
          <>
            <h4 className="text-base font-bold text-[#16170F] font-title">
              Nenhuma {mode === 'despesa' ? 'despesa' : 'receita'} cadastrada
            </h4>
            <p className="text-xs text-[#5C5E54] max-w-sm mt-2 mb-8 font-semibold leading-relaxed">
              Comece a registrar os fluxos operacionais de {mode === 'despesa' ? 'despesas' : 'receitas'} para visualizar nesta competência.
            </p>
            {onTriggerAdd && !isMonthClosed && (
              <button
                onClick={onTriggerAdd}
                className="px-5 py-3 text-xs font-bold rounded-lg bg-[#191909] hover:bg-[#777745] text-[#FFFDF7] transition-all shadow-xs flex items-center gap-2 cursor-pointer font-title"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Registrar Primeira {mode === 'despesa' ? 'Despesa' : 'Receita'}</span>
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table View (Restructured to follow PM columns exactly) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-100 bg-brand-sand/40 text-slate-800 text-xs md:text-sm font-black tracking-wider uppercase">
              <th className="px-6 py-5">Descrição</th>
              <th className="px-6 py-5">Categoria</th>
              <th className="px-6 py-5">Vencimento</th>
              <th className="px-6 py-5 text-right">Valor</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5">Forma de Pagamento</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm md:text-base text-slate-900 font-semibold">
            {mode === 'despesa' ? (
              // RENDER EXPENSES
              (expenses as Expense[]).map(exp => {
                const cat = getCategoryDetails(exp.categoryId);
                const Icon = cat.Icon;

                return (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Descrição Column: Title description + lower details (Fornecedor + Centro de Custo) */}
                    <td className="px-6 py-6.5">
                      <div className="space-y-1.5 text-left">
                        <span className="font-extrabold text-slate-900 text-sm md:text-base block">{exp.description}</span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs text-slate-500 font-semibold leading-none">
                          <span>{exp.supplier}</span>
                          {exp.costCenter && (
                            <>
                              <span>&bull;</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/40 text-slate-650 font-bold uppercase tracking-wider text-[9px]">
                                {exp.costCenter}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoria Column: icon square + label + badge */}
                    <td className="px-6 py-6.5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-3xs"
                          style={{
                            backgroundColor: cat.iconBg,
                            color: cat.iconColor
                          }}
                        >
                          <Icon className="w-4.5 h-4.5 font-bold" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-slate-900 text-xs md:text-sm">{cat.name}</span>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                            {exp.isRecurring ? 'Recorrente' : 'Avulsa'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Vencimento Column: Due Date (and payment date if paid) */}
                    <td className="px-6 py-6.5 text-xs md:text-sm text-slate-700">
                      <div className="text-left space-y-0.5">
                        <span className="block font-bold">{formatDate(exp.dueDate)}</span>
                        {exp.status === 'pago' && exp.paymentDate && (
                          <span className="block text-[10px] md:text-xs text-status-success-text font-semibold">
                            Pago em: {formatDate(exp.paymentDate)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Valor Column */}
                    <td className="px-6 py-6.5 text-right">
                      <CurrencyValue value={-exp.amount} colorType="negative" size="md" />
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-6.5 text-center">
                      <div className="inline-flex justify-center w-full">
                        <StatusBadge status={exp.status} />
                      </div>
                    </td>

                    {/* Forma de Pagamento Column */}
                    <td className="px-6 py-6.5 text-xs md:text-sm text-slate-750 font-bold capitalize">
                      {exp.status === 'pago' ? (exp.paymentMethod || '—') : '—'}
                    </td>

                    {/* Ações Column (Click targets) */}
                    <td className="px-6 py-6.5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                        {(exp.status === 'pendente' || exp.status === 'atrasado') && (
                          <button
                            onClick={() => onPay(exp.id)}
                            className="px-3.5 py-2 rounded-lg border border-status-success-border bg-status-success-bg text-status-success-text hover:bg-status-success-text hover:text-white transition-all cursor-pointer shadow-xs text-xs font-bold flex items-center gap-1.5"
                            title="Confirmar pagamento"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Dar Baixa</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => onViewDetails(exp.id, 'despesa')}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEdit(exp.id, 'despesa')}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(exp.id, 'despesa')}
                          className="p-2 rounded-lg border border-red-200/60 bg-white text-red-650 hover:bg-red-50 transition-all cursor-pointer shadow-2xs"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              // RENDER INCOMES
              (incomes as Income[]).map(inc => {
                const cat = getCategoryDetails(inc.categoryId);
                const Icon = cat.Icon;

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Descrição Column: Title description + lower details */}
                    <td className="px-6 py-6.5">
                      <div className="space-y-1.5 text-left">
                        <span className="font-extrabold text-slate-900 text-sm md:text-base block">{inc.description}</span>
                        <p className="text-[11px] md:text-xs text-slate-500 font-semibold leading-none">
                          Origem: {inc.source}
                        </p>
                      </div>
                    </td>

                    {/* Categoria Column: icon square + label + badge */}
                    <td className="px-6 py-6.5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-3xs"
                          style={{
                            backgroundColor: cat.iconBg,
                            color: cat.iconColor
                          }}
                        >
                          <Icon className="w-4.5 h-4.5 font-bold" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-slate-900 text-xs md:text-sm">{cat.name}</span>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                            Receita
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Vencimento Column */}
                    <td className="px-6 py-6.5 text-xs md:text-sm text-slate-700">
                      <span className="font-bold block text-left">{formatDate(inc.receivedDate)}</span>
                    </td>

                    {/* Valor Column */}
                    <td className="px-6 py-6.5 text-right">
                      <CurrencyValue value={inc.amount} colorType="positive" size="md" />
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-6.5 text-center">
                      <div className="inline-flex justify-center w-full">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black rounded-full border border-status-success-border bg-status-success-bg text-status-success-text">
                          Recebido
                        </span>
                      </div>
                    </td>

                    {/* Forma de Pagamento Column */}
                    <td className="px-6 py-6.5 text-xs md:text-sm text-slate-750 font-bold capitalize">
                      {inc.paymentMethod || '—'}
                    </td>

                    {/* Ações Column (Click targets) */}
                    <td className="px-6 py-6.5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewDetails(inc.id, 'receita')}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEdit(inc.id, 'receita')}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(inc.id, 'receita')}
                          className="p-2 rounded-lg border border-red-200/60 bg-white text-red-650 hover:bg-red-50 transition-all cursor-pointer shadow-2xs"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-4 font-sans">
        {mode === 'despesa' ? (
          // MOBILE EXPENSES CARD
          (expenses as Expense[]).map(exp => {
            const cat = getCategoryDetails(exp.categoryId);
            const Icon = cat.Icon;

            return (
              <div key={exp.id} className="p-5 rounded-lg border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-1.5 rounded-md border border-slate-100"
                      style={{
                        color: cat.iconColor,
                        backgroundColor: cat.iconBg
                      }}
                    >
                      <Icon className="w-4 h-4 font-bold" />
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">{cat.name}</span>
                  </div>
                  <StatusBadge status={exp.status} />
                </div>

                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 truncate text-left">
                    <h5 className="font-extrabold text-slate-900 text-base truncate">{exp.description}</h5>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-semibold leading-none">
                      <span>{exp.supplier}</span>
                      {exp.costCenter && (
                        <>
                          <span>&bull;</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/40 text-slate-650 font-bold uppercase tracking-wider text-[8px]">
                            {exp.costCenter}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <CurrencyValue value={-exp.amount} colorType="negative" size="lg" />
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-left">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Vencimento</span>
                    <span className="font-bold text-slate-900">{formatDate(exp.dueDate)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Pagamento</span>
                    <span className="font-bold text-slate-900">{formatDate(exp.paymentDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  {(exp.status === 'pendente' || exp.status === 'atrasado') && (
                    <button
                      onClick={() => onPay(exp.id)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg border border-status-success-border bg-status-success-bg text-status-success-text hover:bg-status-success-text hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Dar Baixa</span>
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(exp.id, 'despesa')}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(exp.id, 'despesa')}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(exp.id, 'despesa')}
                      className="p-2.5 rounded-lg border border-red-200/60 bg-white text-red-650 hover:bg-red-50 transition-all cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // MOBILE INCOMES CARD
          (incomes as Income[]).map(inc => {
            const cat = getCategoryDetails(inc.categoryId);
            const Icon = cat.Icon;

            return (
              <div key={inc.id} className="p-5 rounded-lg border border-slate-200 bg-white space-y-4 shadow-xs text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-1.5 rounded-md border border-slate-100"
                      style={{
                        color: cat.iconColor,
                        backgroundColor: cat.iconBg
                      }}
                    >
                      <Icon className="w-4 h-4 font-bold" />
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">{cat.name}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-extrabold rounded-full border border-status-success-border bg-status-success-bg text-status-success-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success-text" />
                    <span>Recebido</span>
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 truncate text-left">
                    <h5 className="font-extrabold text-slate-900 text-base truncate">{inc.description}</h5>
                    <p className="text-xs text-slate-500 truncate">{inc.source}</p>
                  </div>
                  <CurrencyValue value={inc.amount} colorType="positive" size="lg" />
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-left">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Data de Recebimento</span>
                  <span className="font-bold text-slate-900">{formatDate(inc.receivedDate)}</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onViewDetails(inc.id, 'receita')}
                    className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalhes</span>
                  </button>
                  <button
                    onClick={() => onEdit(inc.id, 'receita')}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(inc.id, 'receita')}
                    className="p-2.5 rounded-lg border border-red-200/60 bg-white text-red-650 hover:bg-red-50 transition-all cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
