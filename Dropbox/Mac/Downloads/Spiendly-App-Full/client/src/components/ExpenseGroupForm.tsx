import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { UserSelect } from './UserSelect';
import { createExpenseGroup } from '@/api';
import { EXPENSE_CATEGORIES } from '@/types';
import { MinusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ExpenseGroupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState<Array<{ user_id: number | null; amount_owed: string }>>([
    { user_id: null, amount_owed: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!category) newErrors.category = 'Category is required';
    
    if (!totalAmount) {
      newErrors.totalAmount = 'Total amount is required';
    } else if (isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      newErrors.totalAmount = 'Amount must be a positive number';
    }
    
    // Validate participants
    let hasParticipants = false;
    let validParticipants = true;
    
    participants.forEach((participant, index) => {
      if (participant.user_id) {
        hasParticipants = true;
        
        if (!participant.amount_owed) {
          newErrors[`participant_${index}_amount`] = 'Amount is required';
          validParticipants = false;
        } else if (isNaN(Number(participant.amount_owed)) || Number(participant.amount_owed) <= 0) {
          newErrors[`participant_${index}_amount`] = 'Must be a positive number';
          validParticipants = false;
        }
      } else if (participant.amount_owed) {
        newErrors[`participant_${index}_user`] = 'Select a person';
        validParticipants = false;
      }
    });
    
    if (!hasParticipants) {
      newErrors.participants = 'At least one participant is required';
    } else if (!validParticipants) {
      newErrors.participants = 'Fix participant errors';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddParticipant = () => {
    if (participants.length >= 6) return;
    setParticipants([...participants, { user_id: null, amount_owed: '' }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index: number, field: 'user_id' | 'amount_owed', value: number | string) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty participants and convert strings to numbers
      const validParticipants = participants
        .filter(p => p.user_id && p.amount_owed)
        .map(p => ({
          user_id: p.user_id!,
          amount_owed: Number(p.amount_owed)
        }));
      
      await createExpenseGroup({
        name,
        description: description || undefined,
        category,
        total_amount: Number(totalAmount),
        participants: validParticipants
      });
      
      // Redirect to the expense groups list
      navigate('/');
    } catch (error) {
      console.error('Failed to create expense group:', error);
      setErrors({ submit: 'Failed to create expense group. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Expense Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Beach Trip 2023"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about this expense"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
            <Input
              id="totalAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              className={`pl-8 ${errors.totalAmount ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.totalAmount && <p className="text-sm text-destructive">{errors.totalAmount}</p>}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Participants</h3>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddParticipant}
            disabled={participants.length >= 6}
          >
            Add Person
          </Button>
        </div>
        
        {errors.participants && (
          <p className="text-sm text-destructive">{errors.participants}</p>
        )}
        
        {participants.length > 0 ? (
          <div className="space-y-4">
            {participants.map((participant, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <Label>Person</Label>
                      <div className="mt-1">
                        <UserSelect
                          value={participant.user_id}
                          onChange={(userId) => handleParticipantChange(index, 'user_id', userId)}
                        />
                      </div>
                      {errors[`participant_${index}_user`] && (
                        <p className="text-sm text-destructive">
                          {errors[`participant_${index}_user`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Amount Owed</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={participant.amount_owed}
                            onChange={(e) => handleParticipantChange(index, 'amount_owed', e.target.value)}
                            placeholder="0.00"
                            className={`pl-8 ${errors[`participant_${index}_amount`] ? 'border-destructive' : ''}`}
                          />
                        </div>
                        
                        {participants.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveParticipant(index)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {errors[`participant_${index}_amount`] && (
                        <p className="text-sm text-destructive">
                          {errors[`participant_${index}_amount`]}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No participants added</p>
        )}
      </div>
      
      {errors.submit && (
        <p className="text-sm text-destructive">{errors.submit}</p>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Expense Group'}
        </Button>
      </div>
    </form>
  );
}
