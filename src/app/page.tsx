'use client';

import { Layout } from '@/components/Layout';
import { ExpenseChart } from '@/components/ExpenseChart';
import { useExpenses } from '@/hooks/useExpenses';
import { calculateExpenseSummary, formatCurrency, exportToCSV, downloadCSV } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';

export default function Dashboard() {
  const { expenses, loading } = useExpenses();
  const summary = calculateExpenseSummary(expenses);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const topCategories = Object.entries(summary.categorySummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your spending and manage your finances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSpending)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.monthlySpending)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{summary.expenseCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. per Expense</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.expenseCount > 0 ? summary.totalSpending / summary.expenseCount : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Spending Categories</h2>
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 mr-3">{formatCurrency(amount)}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
                        style={{
                          width: `${Math.min((amount / summary.totalSpending) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/add-expense"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <p className="font-medium text-gray-900">Add Expense</p>
                <p className="text-sm text-gray-600">Record a new expense</p>
              </div>
            </a>
            <a
              href="/expenses"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-medium text-gray-900">View Expenses</p>
                <p className="text-sm text-gray-600">Browse all expenses</p>
              </div>
            </a>
            <button
              onClick={() => {
                const csvContent = exportToCSV(expenses);
                downloadCSV(csvContent, 'expenses.csv');
              }}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">Download as CSV</p>
              </div>
            </button>
          </div>
        </div>

        {/* Charts and Analytics */}
        {expenses.length > 0 && <ExpenseChart expenses={expenses} />}

        {/* Empty State */}
        {expenses.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <span className="text-6xl mb-4 block">💸</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h2>
            <p className="text-gray-600 mb-6">Start tracking your expenses to see insights and summaries here.</p>
            <a
              href="/add-expense"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="mr-2">➕</span>
              Add Your First Expense
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}