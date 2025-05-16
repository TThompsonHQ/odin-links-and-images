import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { getUserPaymentMethods } from '@/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethodForm } from './PaymentMethodForm';

interface PaymentMethodSelectProps {
  userId: number;
  value: number | null;
  onChange: (paymentMethodId: number | null) => void;
  disabled?: boolean;
}

export function PaymentMethodSelect({
  userId,
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPaymentMethods = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const methods = await getUserPaymentMethods(userId);
      setPaymentMethods(methods);
      
      // If no selection yet but we have a default method, select it
      if (!value && methods.length > 0) {
        const defaultMethod = methods.find(m => m.is_default);
        if (defaultMethod) {
          onChange(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payment methods when userId changes
  useEffect(() => {
    loadPaymentMethods();
  }, [userId]);

  const formatPaymentMethod = (method: PaymentMethod) => {
    const type = method.type === 'bank_account' ? 'Bank' : 'Card';
    return `${type} - ${method.provider} (${method.last_four})`;
  };

  const handleAddSuccess = () => {
    setIsAddingPaymentMethod(false);
    loadPaymentMethods();
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Select
          value={value?.toString() || ''}
          onValueChange={(val) => onChange(val ? Number(val) : null)}
          disabled={disabled || isLoading || !userId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id.toString()}>
                {formatPaymentMethod(method)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsAddingPaymentMethod(true)}
          disabled={disabled || !userId}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Add Payment Method Dialog */}
      <Dialog 
        open={isAddingPaymentMethod} 
        onOpenChange={setIsAddingPaymentMethod}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          
          <PaymentMethodForm
            userId={userId}
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddingPaymentMethod(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
