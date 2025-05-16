import { ColumnType } from 'kysely';

// User table types
export interface UserTable {
  id: ColumnType<number, number, never>;
  name: string;
  email: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

// Expense groups table types
export interface ExpenseGroupTable {
  id: ColumnType<number, number, never>;
  name: string;
  description: string | null;
  category: string;
  total_amount: ColumnType<number, number, number>;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

// Expense participants table types
export interface ExpenseParticipantTable {
  id: ColumnType<number, number, never>;
  expense_group_id: number;
  user_id: number;
  amount_owed: ColumnType<number, number, number>;
  created_at: ColumnType<Date, string | undefined, never>;
}

// Payments table types
export interface PaymentTable {
  id: ColumnType<number, number, never>;
  expense_group_id: number;
  user_id: number;
  amount: ColumnType<number, number, number>;
  payment_date: ColumnType<Date, string | undefined, string>;
  payment_method_id: number | null;
}

// Payment methods table types
export interface PaymentMethodTable {
  id: ColumnType<number, number, never>;
  user_id: number;
  type: string;
  last_four: string;
  provider: string;
  is_default: ColumnType<boolean, boolean | number, boolean | number>;
  created_at: ColumnType<Date, string | undefined, never>;
}

// Expense invites table types
export interface ExpenseInviteTable {
  id: ColumnType<number, number, never>;
  expense_group_id: number;
  invite_code: string;
  created_by: number;
  created_at: ColumnType<Date, string | undefined, never>;
  expires_at: ColumnType<Date, string | undefined, null>;
  used_by: number | null;
  used_at: ColumnType<Date, string | undefined, null>;
}

// Database schema
export interface Database {
  users: UserTable;
  expense_groups: ExpenseGroupTable;
  expense_participants: ExpenseParticipantTable;
  payments: PaymentTable;
  payment_methods: PaymentMethodTable;
  expense_invites: ExpenseInviteTable;
}
