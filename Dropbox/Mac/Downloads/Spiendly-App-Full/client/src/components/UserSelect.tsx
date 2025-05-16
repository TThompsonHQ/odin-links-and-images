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
import { User } from '@/types';
import { getUsers, createUser } from '@/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface UserSelectProps {
  value: number | null;
  onChange: (userId: number) => void;
  disabled?: boolean;
}

export function UserSelect({ value, onChange, disabled = false }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUserName) return;
    
    setIsLoading(true);
    try {
      const newUser = await createUser({
        name: newUserName,
        email: newUserEmail || undefined,
      });
      
      setUsers([...users, newUser]);
      onChange(newUser.id);
      setNewUserName('');
      setNewUserEmail('');
      setIsAddingUser(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserName(e.target.value);
  };

  const handleNewUserEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserEmail(e.target.value);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Select
          value={value?.toString() || ''}
          onValueChange={(val) => onChange(Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select person" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsAddingUser(true)}
          disabled={disabled}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={handleNewUserNameChange}
                placeholder="Enter name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={handleNewUserEmailChange}
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserName || isLoading}>
              {isLoading ? 'Adding...' : 'Add Person'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
