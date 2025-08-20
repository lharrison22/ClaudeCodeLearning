'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseFormData, Expense } from '@/types/expense';
import { EXPENSE_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';

export default function EditExpensePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { expenses, updateExpense } = useExpenses();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: '',
    amount: '',
    category: 'Other',
    description: '',
  });

  useEffect(() => {
    const foundExpense = expenses.find(e => e.id === id);
    if (foundExpense) {
      setExpense(foundExpense);
      setFormData({
        date: foundExpense.date,
        amount: foundExpense.amount.toString(),
        category: foundExpense.category,
        description: foundExpense.description,
      });
    }
  }, [expenses, id]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ExpenseFormData> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expense || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedExpense: Expense = {
        ...expense,
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        updatedAt: new Date().toISOString(),
      };

      const success = updateExpense(updatedExpense);
      
      if (success) {
        router.push('/expenses?updated=true');
      } else {
        setErrors({ description: 'Failed to update expense. Please try again.' });
      }
    } catch {
      setErrors({ description: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!expense) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <span className="text-red-500 mr-2">❌</span>
              <div>
                <p className="text-red-800 font-medium">Expense not found</p>
                <p className="text-red-700 text-sm mt-1">The expense you&apos;re trying to edit doesn&apos;t exist.</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push('/expenses')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Go back to expenses
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-gray-600 mt-2">Update the details of your expense</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Input */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EXPENSE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleInputChange('category', category)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.category === category
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl mr-2">{CATEGORY_ICONS[category]}</span>
                    <span className="text-sm font-medium">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                placeholder="Enter expense description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Expense'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Editing expense</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Original expense created: {new Date(expense.createdAt).toLocaleString()}</li>
            <li>• Last updated: {new Date(expense.updatedAt).toLocaleString()}</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}