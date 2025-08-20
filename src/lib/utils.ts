import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Expense, ExpenseSummary, ExpenseCategory } from '@/types/expense';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categorySummary = expenses.reduce((summary, expense) => {
    summary[expense.category] = (summary[expense.category] || 0) + expense.amount;
    return summary;
  }, {} as Record<string, number>);

  return {
    totalSpending,
    monthlySpending,
    categorySummary: categorySummary as Record<ExpenseCategory, number>,
    expenseCount: expenses.length,
  };
}

export function exportToCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map(expense => [
    expense.date,
    expense.category,
    expense.description,
    expense.amount.toString(),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}