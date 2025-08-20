import { ExpenseCategory } from '@/types/expense';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: 'bg-red-500',
  Transportation: 'bg-blue-500',
  Entertainment: 'bg-purple-500',
  Shopping: 'bg-pink-500',
  Bills: 'bg-green-500',
  Other: 'bg-gray-500',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: '🍽️',
  Transportation: '🚗',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
};

export const STORAGE_KEY = 'expense-tracker-data';