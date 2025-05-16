import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteDetails } from '@/types';
import { getInviteByCode, joinExpenseGroup, createUser } from '@/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserSelect } from '@/components/UserSelect';
import { toast } from '@/components/ui/use-toast';

export function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [amountOwed, setAmountOwed] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!code) return;
      
      try {
        setIsLoading(true);
        const data = await getInviteByCode(code);
        setInvite(data);
        
        if (data.expired) {
          setError('This invite link has expired.');
        } else if (data.used) {
          setError('This invite link has already been used.');
        }
      } catch (err) {
        console.error('Failed to fetch invite details:', err);
        setError('Failed to load invite details. This invite link may be invalid.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteDetails();
  }, [code]);

  const handleCreateUser = async () => {
    if (!userName) return;
    
    try {
      setIsCreatingUser(true);
      const newUser = await createUser({
        name: userName,
        email: userEmail || undefined,
      });
      
      setUserId(newUser.id);
      toast({
        title: "User created",
        description: `Welcome, ${newUser.name}!`,
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!userId || !code) return;
    
    try {
      setIsJoining(true);
      
      await joinExpenseGroup(code, {
        user_id: userId,
        amount_owed: amountOwed ? Number(amountOwed) : undefined,
      });
      
      toast({
        title: "Success!",
        description: "You have joined the expense group.",
      });
      
      // Redirect to the expense group page
      if (invite) {
        navigate(`/expenses/${invite.expense_group_id}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to join expense group:', error);
      let errorMessage = 'Failed to join expense group. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse space-y-2 text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
          <p className="text-muted-foreground">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {error || 'This invite link is invalid or has expired.'}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <span>{getCategoryIcon(invite.expense_group_category)}</span>
            Join "{invite.expense_group_name}"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>You've been invited to join this expense group by {invite.created_by_name}.</p>
          </div>
          
          <div className="space-y-4">
            {!userId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Choose your profile</Label>
                  <UserSelect
                    value={userId}
                    onChange={setUserId}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or create new profile
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCreateUser}
                  disabled={!userName || isCreatingUser}
                >
                  {isCreatingUser ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount You Owe (optional)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amountOwed}
                      onChange={(e) => setAmountOwed(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can set this later if you're not sure.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button 
                    variant="outline" 
                    onClick={() => setUserId(null)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleJoinGroup}
                    disabled={isJoining}
                    className="flex-1"
                  >
                    {isJoining ? 'Joining...' : 'Join Group'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
