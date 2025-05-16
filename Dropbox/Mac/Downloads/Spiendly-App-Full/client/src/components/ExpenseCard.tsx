import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseGroup } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExpenseCardProps {
  expense: ExpenseGroup;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const getDateFormatted = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Trip':
        return '✈️';
      case 'Dinner':
        return '🍽️';
      case 'Movie Tickets':
        return '🎬';
      case 'Rent':
        return '🏠';
      case 'Bills':
        return '📄';
      case 'Groceries':
        return '🛒';
      case 'Transportation':
        return '🚗';
      case 'Gift':
        return '🎁';
      default:
        return '💰';
    }
  };

  return (
    <Link to={`/expenses/${expense.id}`} className="block hover:no-underline">
      <Card className="h-full transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{expense.name}</span>
            <span className="text-xl ml-2">{getCategoryIcon(expense.category)}</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {getDateFormatted(expense.created_at)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-xl font-semibold">{formatCurrency(expense.total_amount)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
