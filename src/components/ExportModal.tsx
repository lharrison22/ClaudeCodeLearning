'use client';

import { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { EXPENSE_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories: ExpenseCategory[];
  customFilename: string;
}

export function ExportModal({ isOpen, onClose, expenses }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: {
      start: '',
      end: ''
    },
    categories: [...EXPENSE_CATEGORIES],
    customFilename: 'expenses'
  });
  const [showPreview, setShowPreview] = useState(false);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      setFilters({
        dateRange: {
          start: thirtyDaysAgo.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        },
        categories: [...EXPENSE_CATEGORIES],
        customFilename: 'expenses'
      });
      setShowPreview(false);
      setSelectedFormat('csv');
    }
  }, [isOpen]);

  // Filter expenses based on current filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Date range filter
      if (filters.dateRange.start && expense.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && expense.date > filters.dateRange.end) return false;
      
      // Category filter
      if (!filters.categories.includes(expense.category)) return false;
      
      return true;
    });
  }, [expenses, filters]);

  const exportSummary = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryCounts = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return {
      totalRecords: filteredExpenses.length,
      totalAmount,
      dateRange: {
        start: filters.dateRange.start,
        end: filters.dateRange.end
      },
      categoryCounts
    };
  }, [filteredExpenses, filters]);

  const handleCategoryToggle = (category: ExpenseCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSelectAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: [...EXPENSE_CATEGORIES]
    }));
  };

  const handleDeselectAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: []
    }));
  };

  const generateCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense.date,
        expense.category,
        expense.amount.toString(),
        `"${expense.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  };

  const generateJSON = () => {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: filteredExpenses.length,
        filters: filters
      },
      expenses: filteredExpenses.map(expense => ({
        id: expense.id,
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt
      }))
    };

    return JSON.stringify(exportData, null, 2);
  };

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);
    
    // Add summary
    doc.setFontSize(12);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Records: ${exportSummary.totalRecords}`, 20, 45);
    doc.text(`Total Amount: ${formatCurrency(exportSummary.totalAmount)}`, 20, 55);
    doc.text(`Date Range: ${formatDate(exportSummary.dateRange.start)} - ${formatDate(exportSummary.dateRange.end)}`, 20, 65);

    // Add table
    autoTable(doc, {
      head: [['Date', 'Category', 'Amount', 'Description']],
      body: filteredExpenses.map(expense => [
        formatDate(expense.date),
        expense.category,
        formatCurrency(expense.amount),
        expense.description
      ]),
      startY: 75,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    return doc;
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export with current filters.');
      return;
    }

    setIsLoading(true);
    
    try {
      const filename = filters.customFilename || 'expenses';
      
      switch (selectedFormat) {
        case 'csv': {
          const csvContent = generateCSV();
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          downloadFile(blob, `${filename}.csv`);
          break;
        }
        case 'json': {
          const jsonContent = generateJSON();
          const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
          downloadFile(blob, `${filename}.json`);
          break;
        }
        case 'pdf': {
          const doc = await generatePDF();
          doc.save(`${filename}.pdf`);
          break;
        }
      }
      
      // Small delay to show loading state
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setIsLoading(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Export Expenses</h2>
              <p className="text-gray-600">Configure and download your expense data</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Export Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'csv' as const, label: 'CSV', desc: 'Spreadsheet compatible', icon: '📊' },
                  { value: 'json' as const, label: 'JSON', desc: 'Developer friendly', icon: '⚡' },
                  { value: 'pdf' as const, label: 'PDF', desc: 'Professional report', icon: '📋' }
                ].map(format => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedFormat === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{format.icon}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedFormat === format.value 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-2">{format.label}</h3>
                    <p className="text-sm text-gray-600">{format.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">Categories</label>
                <div className="space-x-2">
                  <button
                    onClick={handleSelectAllCategories}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAllCategories}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                    <span className="text-sm text-gray-900">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Filename */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Filename</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={filters.customFilename}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    customFilename: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')
                  }))}
                  placeholder="expenses"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  .{selectedFormat}
                </span>
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Export Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Records:</span>
                  <span className="ml-2 font-medium">{exportSummary.totalRecords}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium">{formatCurrency(exportSummary.totalAmount)}</span>
                </div>
              </div>
              {exportSummary.totalRecords > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(exportSummary.categoryCounts).map(([category, count]) => (
                    <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white">
                      {CATEGORY_ICONS[category as ExpenseCategory]} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showPreview"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showPreview" className="text-sm text-gray-900">
                Show data preview
              </label>
            </div>

            {/* Data Preview */}
            {showPreview && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium text-gray-900">Preview ({filteredExpenses.length} records)</h4>
                </div>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.slice(0, 10).map((expense, index) => (
                        <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatDate(expense.date)}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className="inline-flex items-center">
                              {CATEGORY_ICONS[expense.category]} 
                              <span className="ml-1">{expense.category}</span>
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                            {expense.description}
                          </td>
                        </tr>
                      ))}
                      {filteredExpenses.length > 10 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                            ... and {filteredExpenses.length - 10} more records
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isLoading || filteredExpenses.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Export {exportSummary.totalRecords} Records</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}