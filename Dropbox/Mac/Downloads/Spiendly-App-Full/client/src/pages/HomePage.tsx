import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExpenseCard } from '@/components/ExpenseCard';
import { ExpenseGroup } from '@/types';
import { getExpenseGroups } from '@/api';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [expenses, setExpenses] = useState<ExpenseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const data = await getExpenseGroups();
        setExpenses(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
        setError('Failed to load expenses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Cost Share</h1>
        <Link to="/expenses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse space-y-2 text-center">
            <div className="h-8 w-32 bg-muted rounded mx-auto"></div>
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto bg-muted rounded-full h-16 w-16 flex items-center justify-center text-2xl">
            💰
          </div>
          <h2 className="text-xl font-semibold">No expenses yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start by creating a new expense to share costs with your friends.
          </p>
          <Link to="/expenses/new">
            <Button className="mt-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Expense
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
