'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';
import { ExpenseStorage } from '@/lib/storage';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = () => {
      try {
        const savedExpenses = ExpenseStorage.getExpenses();
        setExpenses(savedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const addExpense = (expense: Expense) => {
    try {
      const newExpenses = ExpenseStorage.addExpense(expense);
      setExpenses(newExpenses);
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      return false;
    }
  };

  const updateExpense = (expense: Expense) => {
    try {
      const newExpenses = ExpenseStorage.updateExpense(expense);
      setExpenses(newExpenses);
      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      return false;
    }
  };

  const deleteExpense = (expenseId: string) => {
    try {
      const newExpenses = ExpenseStorage.deleteExpense(expenseId);
      setExpenses(newExpenses);
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  };

  const filterExpenses = (filters: ExpenseFilters) => {
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
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    filterExpenses,
  };
}