import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import * as db from './db/index.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Users endpoints
app.get('/api/users', async (req: express.Request, res: express.Response) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req: express.Request, res: express.Response) => {
  try {
    const { name, email } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    const user = await db.createUser(name, email);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Expense groups endpoints
app.get('/api/expense-groups', async (req: express.Request, res: express.Response) => {
  try {
    const expenseGroups = await db.getExpenseGroups();
    res.json(expenseGroups);
  } catch (error) {
    console.error('Error fetching expense groups:', error);
    res.status(500).json({ error: 'Failed to fetch expense groups' });
  }
});

app.get('/api/expense-groups/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }
    
    const expenseGroup = await db.getExpenseGroupWithParticipants(id);
    
    if (!expenseGroup) {
      res.status(404).json({ error: 'Expense group not found' });
      return;
    }
    
    res.json(expenseGroup);
  } catch (error) {
    console.error('Error fetching expense group:', error);
    res.status(500).json({ error: 'Failed to fetch expense group' });
  }
});

app.post('/api/expense-groups', async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, category, total_amount, participants } = req.body;
    
    if (!name || !category || !total_amount || !participants || !Array.isArray(participants)) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    if (participants.length > 6) {
      res.status(400).json({ error: 'Maximum 6 participants allowed' });
      return;
    }
    
    const expenseGroup = await db.createExpenseGroup({
      name,
      description,
      category,
      total_amount,
      participants
    });
    
    res.status(201).json(expenseGroup);
  } catch (error) {
    console.error('Error creating expense group:', error);
    res.status(500).json({ error: 'Failed to create expense group' });
  }
});

// Payments endpoints
app.post('/api/payments', async (req: express.Request, res: express.Response) => {
  try {
    const { expense_group_id, user_id, amount, payment_method_id } = req.body;
    
    if (!expense_group_id || !user_id || amount === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const payment = await db.addPayment({
      expense_group_id,
      user_id,
      amount,
      payment_method_id
    });
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// Payment methods endpoints
app.get('/api/users/:userId/payment-methods', async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }
    
    const paymentMethods = await db.getUserPaymentMethods(userId);
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

app.post('/api/payment-methods', async (req: express.Request, res: express.Response) => {
  try {
    const { user_id, type, last_four, provider, is_default } = req.body;
    
    if (!user_id || !type || !last_four || !provider) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const paymentMethod = await db.addPaymentMethod({
      user_id,
      type,
      last_four,
      provider,
      is_default
    });
    
    res.status(201).json(paymentMethod);
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

// Invite endpoints
app.post('/api/expense-groups/:id/invites', async (req: express.Request, res: express.Response) => {
  try {
    const expenseGroupId = parseInt(req.params.id);
    if (isNaN(expenseGroupId)) {
      res.status(400).json({ error: 'Invalid expense group ID' });
      return;
    }
    
    const { created_by, expires_in_hours } = req.body;
    
    if (!created_by) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const invite = await db.createExpenseInvite({
      expense_group_id: expenseGroupId,
      created_by,
      expires_in_hours
    });
    
    res.status(201).json(invite);
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

app.get('/api/expense-groups/:id/invites', async (req: express.Request, res: express.Response) => {
  try {
    const expenseGroupId = parseInt(req.params.id);
    if (isNaN(expenseGroupId)) {
      res.status(400).json({ error: 'Invalid expense group ID' });
      return;
    }
    
    const invites = await db.getActiveInvites(expenseGroupId);
    res.json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

app.get('/api/invites/:code', async (req: express.Request, res: express.Response) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      res.status(400).json({ error: 'Invalid invite code' });
      return;
    }
    
    const invite = await db.getInviteByCode(code);
    
    if (!invite) {
      res.status(404).json({ error: 'Invite not found' });
      return;
    }
    
    res.json(invite);
  } catch (error) {
    console.error('Error fetching invite:', error);
    res.status(500).json({ error: 'Failed to fetch invite' });
  }
});

app.post('/api/invites/:code/join', async (req: express.Request, res: express.Response) => {
  try {
    const { code } = req.params;
    const { user_id, amount_owed } = req.body;
    
    if (!code || !user_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const expenseGroupId = await db.useInvite({
      invite_code: code,
      user_id,
      amount_owed
    });
    
    res.json({ success: true, expense_group_id: expenseGroupId });
  } catch (error) {
    console.error('Error joining expense group:', error);
    let errorMessage = 'Failed to join expense group';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
