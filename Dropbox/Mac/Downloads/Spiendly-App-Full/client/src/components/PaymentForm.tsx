import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSelect } from './UserSelect';
import { PaymentMethodSelect } from './PaymentMethodSelect';
import { addPayment } from '@/api';

interface PaymentFormProps {
  expenseGroupId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ 
  expenseGroupId, 
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!userId) {
      newErrors.userId = 'Person is required';
    }
    
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await addPayment({
        expense_group_id: expenseGroupId,
        user_id: userId!,
        amount: Number(amount),
        payment_method_id: paymentMethodId || undefined,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to add payment:', error);
      setErrors({ submit: 'Failed to add payment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (id: number) => {
    setUserId(id);
    // Reset payment method when user changes
    setPaymentMethodId(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user">Person</Label>
        <UserSelect 
          value={userId} 
          onChange={handleUserChange} 
          disabled={isLoading}
        />
        {errors.userId && <p className="text-sm text-destructive">{errors.userId}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`pl-8 ${errors.amount ? 'border-destructive' : ''}`}
            disabled={isLoading}
          />
        </div>
        {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
        <PaymentMethodSelect 
          userId={userId || 0} 
          value={paymentMethodId} 
          onChange={setPaymentMethodId}
          disabled={!userId || isLoading}
        />
      </div>
      
      {errors.submit && (
        <p className="text-sm text-destructive">{errors.submit}</p>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Payment'}
        </Button>
      </div>
    </form>
  );
}
