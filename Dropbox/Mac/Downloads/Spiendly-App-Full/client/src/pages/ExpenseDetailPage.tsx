import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseGroupDetails, Payment } from '@/types';
import { getExpenseGroup } from '@/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CreditCard, PlusCircle, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentForm } from '@/components/PaymentForm';
import { InviteDialog } from '@/components/InviteDialog';

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseGroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchExpenseDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await getExpenseGroup(parseInt(id));
      setExpense(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch expense details:', err);
      setError('Failed to load expense details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  // Calculate total paid amount from payments
  const getTotalPaid = (): number => {
    if (!expense?.payments || expense.payments.length === 0) return 0;
    return expense.payments.reduce((total, payment) => total + payment.amount, 0);
  };

  // Calculate payment progress percentage
  const getPaymentProgressPercentage = (): number => {
    if (!expense?.total_amount) return 0;
    const totalPaid = getTotalPaid();
    return Math.min(100, Math.round((totalPaid / expense.total_amount) * 100));
  };

  // Format payment method information for display
  const formatPaymentMethod = (payment: Payment): string => {
    if (!payment.payment_method_type) return 'Not specified';
    
    const type = payment.payment_method_type === 'bank_account' ? 'Bank' : 'Card';
    return `${type} - ${payment.provider} (${payment.last_four})`;
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

  const handlePaymentSuccess = () => {
    setIsAddingPayment(false);
    fetchExpenseDetails();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse space-y-2 text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
          <p className="text-muted-foreground">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error || 'Expense not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="mt-2"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {expense.name}
          <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-lg font-medium">{expense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-medium">{formatDate(expense.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-medium">{formatCurrency(expense.total_amount)}</p>
                </div>
              </div>

              {expense.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{expense.description}</p>
                </div>
              )}

              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(getTotalPaid())} of {formatCurrency(expense.total_amount)} paid
                  </p>
                  <p className="text-sm font-medium">{getPaymentProgressPercentage()}%</p>
                </div>
                <Progress value={getPaymentProgressPercentage()} />
              </div>
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payments</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingPayment(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent>
              {expense.payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No payments have been made yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expense.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.user_name}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatPaymentMethod(payment)}</TableCell>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participants Card */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Participants</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsInviteOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expense.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      {participant.email && (
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                      )}
                    </div>
                    <p className="font-semibold">{formatCurrency(participant.amount_owed)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          
          <PaymentForm
            expenseGroupId={expense.id}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setIsAddingPayment(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <InviteDialog
        expenseGroupId={expense.id}
        expenseGroupName={expense.name}
        userId={expense.participants[0]?.id || 0}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
