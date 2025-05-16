// User type
export interface User {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
}

// Expense Group type
export interface ExpenseGroup {
  id: number;
  name: string;
  description: string | null;
  category: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Expense Group participant type
export interface Participant {
  id: number;
  name: string;
  email: string | null;
  amount_owed: number;
}

// Payment type
export interface Payment {
  id: number;
  user_id: number;
  user_name: string;
  amount: number;
  payment_date: string;
  payment_method_type?: string;
  last_four?: string;
  provider?: string;
}

// Expense Group with details
export interface ExpenseGroupDetails extends ExpenseGroup {
  participants: Participant[];
  payments: Payment[];
}

// Payment Method type
export interface PaymentMethod {
  id: number;
  user_id: number;
  type: string;
  last_four: string;
  provider: string;
  is_default: boolean;
  created_at: string;
}

// Invite type
export interface Invite {
  id: number;
  invite_code: string;
  created_at: string;
  expires_at: string | null;
  used_by: number | null;
  used_at: string | null;
  created_by_name: string;
}

// Invite details type
export interface InviteDetails extends Invite {
  expense_group_id: number;
  expense_group_name: string;
  expense_group_category: string;
  created_by: number;
  expired: boolean;
  used: boolean;
}

// Predefined expense categories
export const EXPENSE_CATEGORIES = [
  'Trip',
  'Dinner',
  'Movie Tickets',
  'Rent',
  'Bills',
  'Groceries',
  'Transportation',
  'Gift',
  'Other'
];

// Payment method types
export const PAYMENT_METHOD_TYPES = [
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'debit_card', label: 'Debit Card' }
];
