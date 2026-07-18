import React, { useState } from 'react';
import { Expense, Category } from '@/types/financial';
import { FilterX, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import CurrencyValue from './CurrencyValue';

interface CategoryCardsGridProps {
  categories: Category[];
  expenses: Expense[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

export default function CategoryCardsGrid({
  categories,
  expenses,
  selectedCategory,
  onSelectCategory,
}: CategoryCardsGridProps) {
  // Toggle show all categories
  const [showAll, setShowAll] = useState(false);

  // Only calculate based on active expenses
  const activeExpenses = expenses.filter(e => e.status !== 'cancelado');
  const totalExpensesAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter to active expense categories
  const activeExpenseCategories = categories.filter(c => c.type === 'despesa' && c.active);

  const categoriesData = activeExpenseCategories.map(cat => {
    const categoryExpenses = activeExpenses.filter(e => e.categoryId === cat.id);
    const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = categoryExpenses.length;
    const percentage = totalExpensesAmount > 0 ? (amount / totalExpensesAmount) * 100 : 0;

    return {
      info: cat,
      amount,
      count,
      percentage,
    };
  });

  // Default to maximum of 6 visible cards to avoid clutter, with showAll override
  const visibleCategories = showAll ? categoriesData : categoriesData.slice(0, 6);

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Filter Option */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-sm font-black text-[#16170F] uppercase tracking-wider font-title">Despesas por Categoria</h3>
          <p className="text-xs text-[#5C5E54] font-semibold mt-1">Filtre a tabela clicando em uma das categorias abaixo</p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-[#A95454]/20 bg-[#FAF2F2] text-[#A95454] hover:bg-[#FAF2F2]/80 transition-all cursor-pointer shadow-xs animate-in fade-in duration-200"
          >
            <FilterX className="w-4 h-4" />
            <span>Limpar Filtro ({selectedCategory})</span>
          </button>
        )}
      </div>

      {/* Grid of categories cards (Clean, spaced, 6 columns max) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {visibleCategories.map(({ info, amount, count, percentage }) => {
          const isSelected = selectedCategory === info.name;
          const LucideIcon = (Icons as any)[info.icon] || HelpCircle;

          return (
            <div
              key={info.id}
              onClick={() => onSelectCategory(isSelected ? null : info.name)}
              className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 select-none flex flex-col justify-between h-[135px] shadow-2xs ${
                isSelected
                  ? `bg-[#EAF2FF] border-[#173B72] scale-[1.02] shadow-sm`
                  : 'bg-white border-[#E6E1D6] hover:bg-[#F8F7F2] hover:border-slate-300'
              }`}
            >
              {/* Top-left: Cohesive icon square */}
              <div className="flex items-start justify-between">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center shadow-3xs"
                  style={{
                    backgroundColor: `var(--color-${info.color}-dark, #EAF2FF)`,
                    color: `var(--color-${info.color}-primary, #173B72)`,
                  }}
                >
                  <LucideIcon className="w-4.5 h-4.5 font-bold" />
                </div>
                
                {isSelected && (
                  <span className="text-[#173B72] font-extrabold uppercase tracking-widest text-[8px]">
                    Ativo
                  </span>
                )}
              </div>

              {/* Bottom: Texts stacked vertically */}
              <div className="text-left mt-3">
                <span className="text-[12px] font-black text-slate-900 truncate block max-w-full leading-tight">
                  {info.name}
                </span>
                
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-1">
                  <span>{percentage.toFixed(0)}% do total</span>
                  {isSelected && amount > 0 && (
                    <CurrencyValue value={amount} colorType="neutral" size="sm" className="text-[10px] text-slate-500 font-bold" />
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Ver Mais / Ver Menos Toggle button if categories count > 6 */}
      {categoriesData.length > 6 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-5 py-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 text-brand-accent" />
                <span>Ver Menos Categorias</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-brand-accent" />
                <span>Ver Mais Categorias ({categoriesData.length - 6})</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
