'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseFilters, ExpenseCategory } from '@/types/expense';
import { EXPENSE_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import { formatCurrency, formatDate, exportToCSV, downloadCSV } from '@/lib/utils';

function ExpensesContent() {
  const searchParams = useSearchParams();
  const { expenses, loading, deleteExpense } = useExpenses();
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: undefined,
    startDate: '',
    endDate: '',
    searchTerm: '',
  });

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    if (searchParams.get('updated') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [searchParams]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      if (filters.startDate && expense.date < filters.startDate) {
        return false;
      }

      if (filters.endDate && expense.date > filters.endDate) {
        return false;
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [expenses, filters]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredExpenses]);

  const handleDeleteExpense = (expenseId: string) => {
    if (deleteExpense(expenseId)) {
      setDeleteConfirm(null);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(filteredExpenses);
    downloadCSV(csvContent, `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const clearFilters = () => {
    setFilters({
      category: undefined,
      startDate: '',
      endDate: '',
      searchTerm: '',
    });
  };

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate || filters.searchTerm;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <span className="text-green-500 mr-2">✅</span>
              <p className="text-green-800">
                {searchParams.get('success') === 'true' ? 'Expense added successfully!' : 'Expense updated successfully!'}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-2">
              {sortedExpenses.length} of {expenses.length} expenses
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📊 Export CSV
            </button>
            <a
              href="/add-expense"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ➕ Add Expense
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search description or category..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  category: e.target.value as ExpenseCategory || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {CATEGORY_ICONS[category]} {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {sortedExpenses.length} of {expenses.length} expenses
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Expenses List */}
        {sortedExpenses.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            {expenses.length === 0 ? (
              <>
                <span className="text-6xl mb-4 block">💸</span>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h2>
                <p className="text-gray-600 mb-6">Start tracking your expenses by adding your first expense.</p>
                <a
                  href="/add-expense"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span className="mr-2">➕</span>
                  Add Your First Expense
                </a>
              </>
            ) : (
              <>
                <span className="text-6xl mb-4 block">🔍</span>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No expenses match your filters</h2>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or clear the filters.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{CATEGORY_ICONS[expense.category]}</span>
                            <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={expense.description}>
                            {expense.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`/edit-expense/${expense.id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              ✏️ Edit
                            </a>
                            <button
                              onClick={() => setDeleteConfirm(expense.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedExpenses.map((expense) => (
                <div key={expense.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{CATEGORY_ICONS[expense.category]}</span>
                      <span className="font-medium text-gray-900">{expense.category}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{expense.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
                    <div className="flex gap-3">
                      <a
                        href={`/edit-expense/${expense.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors text-sm"
                      >
                        ✏️ Edit
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(expense.id)}
                        className="text-red-600 hover:text-red-900 transition-colors text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
        {sortedExpenses.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average per Expense</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0) / sortedExpenses.length)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Number of Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{sortedExpenses.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Expense</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteExpense(deleteConfirm)}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    }>
      <ExpensesContent />
    </Suspense>
  );
}