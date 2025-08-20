export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface ExpenseSummary {
  totalSpending: number;
  monthlySpending: number;
  categorySummary: Record<ExpenseCategory, number>;
  expenseCount: number;
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: ExpenseCategory;
  description: string;
}