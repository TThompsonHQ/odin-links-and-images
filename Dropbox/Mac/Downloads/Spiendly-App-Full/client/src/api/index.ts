// API functions for the CostShare app

// Get all users
export async function getUsers() {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

// Create user
export async function createUser(userData: { name: string; email?: string }) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}

// Get all expense groups
export async function getExpenseGroups() {
  const response = await fetch('/api/expense-groups');
  if (!response.ok) {
    throw new Error('Failed to fetch expense groups');
  }
  return response.json();
}

// Get expense group by ID with participants and payments
export async function getExpenseGroup(id: number) {
  const response = await fetch(`/api/expense-groups/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch expense group');
  }
  return response.json();
}

// Create expense group
export async function createExpenseGroup(expenseGroupData: {
  name: string;
  description?: string;
  category: string;
  total_amount: number;
  participants: Array<{ user_id: number; amount_owed: number }>;
}) {
  const response = await fetch('/api/expense-groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseGroupData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create expense group');
  }
  
  return response.json();
}

// Add payment to expense group
export async function addPayment(paymentData: {
  expense_group_id: number;
  user_id: number;
  amount: number;
  payment_method_id?: number;
}) {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add payment');
  }
  
  return response.json();
}

// Get payment methods for user
export async function getUserPaymentMethods(userId: number) {
  const response = await fetch(`/api/users/${userId}/payment-methods`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  return response.json();
}

// Add payment method
export async function addPaymentMethod(paymentMethodData: {
  user_id: number;
  type: string;
  last_four: string;
  provider: string;
  is_default?: boolean;
}) {
  const response = await fetch('/api/payment-methods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentMethodData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add payment method');
  }
  
  return response.json();
}

// Create invite for expense group
export async function createExpenseInvite(expenseGroupId: number, data: {
  created_by: number;
  expires_in_hours?: number;
}) {
  const response = await fetch(`/api/expense-groups/${expenseGroupId}/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create invite');
  }
  
  return response.json();
}

// Get active invites for expense group
export async function getExpenseGroupInvites(expenseGroupId: number) {
  const response = await fetch(`/api/expense-groups/${expenseGroupId}/invites`);
  if (!response.ok) {
    throw new Error('Failed to fetch invites');
  }
  return response.json();
}

// Get invite details by code
export async function getInviteByCode(inviteCode: string) {
  const response = await fetch(`/api/invites/${inviteCode}`);
  if (!response.ok) {
    throw new Error('Failed to fetch invite details');
  }
  return response.json();
}

// Join expense group using invite
export async function joinExpenseGroup(inviteCode: string, data: {
  user_id: number;
  amount_owed?: number;
}) {
  const response = await fetch(`/api/invites/${inviteCode}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to join expense group');
  }
  
  return response.json();
}
