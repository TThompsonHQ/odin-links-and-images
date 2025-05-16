import { ExpenseGroupForm } from '@/components/ExpenseGroupForm';

export function NewExpensePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Expense</h1>
      <ExpenseGroupForm />
    </div>
  );
}
