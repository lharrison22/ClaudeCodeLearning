import { Expense } from '@/types/expense';
import { STORAGE_KEY } from './constants';

export class ExpenseStorage {
  static getExpenses(): Expense[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const expenses = JSON.parse(data);
      if (!Array.isArray(expenses)) {
        console.warn('Invalid expense data format, returning empty array');
        this.clearAllExpenses();
        return [];
      }
      
      return expenses.filter(expense => {
        return expense && 
               typeof expense.id === 'string' &&
               typeof expense.amount === 'number' &&
               typeof expense.category === 'string' &&
               typeof expense.description === 'string' &&
               typeof expense.date === 'string';
      });
    } catch (error) {
      console.error('Error loading expenses from storage:', error);
      this.clearAllExpenses();
      return [];
    }
  }

  static saveExpenses(expenses: Expense[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to storage:', error);
    }
  }

  static addExpense(expense: Expense): Expense[] {
    const expenses = this.getExpenses();
    const newExpenses = [...expenses, expense];
    this.saveExpenses(newExpenses);
    return newExpenses;
  }

  static updateExpense(updatedExpense: Expense): Expense[] {
    const expenses = this.getExpenses();
    const newExpenses = expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    this.saveExpenses(newExpenses);
    return newExpenses;
  }

  static deleteExpense(expenseId: string): Expense[] {
    const expenses = this.getExpenses();
    const newExpenses = expenses.filter(expense => expense.id !== expenseId);
    this.saveExpenses(newExpenses);
    return newExpenses;
  }

  static clearAllExpenses(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}