import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAYMENT_METHOD_TYPES } from '@/types';
import { addPaymentMethod } from '@/api';

interface PaymentMethodFormProps {
  userId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentMethodForm({ 
  userId, 
  onSuccess, 
  onCancel 
}: PaymentMethodFormProps) {
  const [type, setType] = useState('');
  const [provider, setProvider] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!type) {
      newErrors.type = 'Payment method type is required';
    }
    
    if (!provider) {
      newErrors.provider = 'Provider name is required';
    }
    
    if (!lastFour) {
      newErrors.lastFour = 'Last 4 digits are required';
    } else if (!/^\d{4}$/.test(lastFour)) {
      newErrors.lastFour = 'Must be exactly 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await addPaymentMethod({
        user_id: userId,
        type,
        provider,
        last_four: lastFour,
        is_default: isDefault,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to add payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Payment Method Type</Label>
        <Select
          value={type}
          onValueChange={setType}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHOD_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder={type === 'bank_account' ? 'Bank name' : 'Card issuer'}
        />
        {errors.provider && <p className="text-sm text-destructive">{errors.provider}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="lastFour">Last 4 Digits</Label>
        <Input
          id="lastFour"
          value={lastFour}
          onChange={(e) => setLastFour(e.target.value)}
          placeholder="Last 4 digits"
          maxLength={4}
        />
        {errors.lastFour && <p className="text-sm text-destructive">{errors.lastFour}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(checked === true)}
        />
        <Label htmlFor="isDefault">Set as default payment method</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Payment Method'}
        </Button>
      </div>
    </form>
  );
}
