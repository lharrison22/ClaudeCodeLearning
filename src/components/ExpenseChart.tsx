'use client';

import { useMemo } from 'react';
import { Expense } from '@/types/expense';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface ExpenseChartProps {
  expenses: Expense[];
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const categoryData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const monthlyTotals = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({
        month,
        amount,
        displayMonth: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [expenses]);

  const maxMonthlyAmount = Math.max(...monthlyData.map(d => d.amount), 1);

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
        <span className="text-4xl block mb-2">📊</span>
        <p className="text-gray-600">No data to display charts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {categoryData.map(({ category, amount, percentage }) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          <div className="space-y-3">
            {monthlyData.map(({ month, amount, displayMonth }) => (
              <div key={month} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{displayMonth}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(amount / maxMonthlyAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Highest Category</p>
            <p className="text-lg font-bold text-blue-900">
              {categoryData[0]?.category || 'N/A'}
            </p>
            <p className="text-sm text-blue-700">
              {categoryData[0] ? formatCurrency(categoryData[0].amount) : '$0'}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Average Expense</p>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0)}
            </p>
            <p className="text-sm text-green-700">
              {expenses.length} expenses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}