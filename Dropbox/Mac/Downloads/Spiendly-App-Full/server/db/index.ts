import path from 'path';
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { Database as DatabaseSchema } from './schema.js';
import crypto from 'crypto';

// Get the data directory from environment variables
const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');

// Initialize SQLite database instance
const sqliteDb = new Database(path.join(dataDir, 'database.sqlite'));

// Create Kysely instance with SQLite dialect
export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});

// Helper functions for common database operations

// Get all expense groups
export async function getExpenseGroups() {
  return db.selectFrom('expense_groups')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute();
}

// Get expense group with participants
export async function getExpenseGroupWithParticipants(id: number) {
  const expenseGroup = await db.selectFrom('expense_groups')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!expenseGroup) {
    return null;
  }

  const participants = await db.selectFrom('expense_participants')
    .innerJoin('users', 'users.id', 'expense_participants.user_id')
    .select([
      'users.id',
      'users.name',
      'users.email',
      'expense_participants.amount_owed'
    ])
    .where('expense_participants.expense_group_id', '=', id)
    .execute();

  const payments = await db.selectFrom('payments')
    .innerJoin('users', 'users.id', 'payments.user_id')
    .leftJoin('payment_methods', 'payment_methods.id', 'payments.payment_method_id')
    .select([
      'payments.id',
      'payments.amount',
      'payments.payment_date',
      'users.name as user_name',
      'users.id as user_id',
      'payment_methods.type as payment_method_type',
      'payment_methods.last_four',
      'payment_methods.provider'
    ])
    .where('payments.expense_group_id', '=', id)
    .orderBy('payments.payment_date', 'desc')
    .execute();

  return {
    ...expenseGroup,
    participants,
    payments
  };
}

// Create new user
export async function createUser(name: string, email?: string) {
  return db.insertInto('users')
    .values({
      name,
      email: email || null
    })
    .returningAll()
    .executeTakeFirst();
}

// Get all users
export async function getUsers() {
  return db.selectFrom('users')
    .selectAll()
    .orderBy('name')
    .execute();
}

// Create expense group
export async function createExpenseGroup(data: {
  name: string;
  description?: string;
  category: string;
  total_amount: number;
  participants: Array<{ user_id: number; amount_owed: number }>;
}) {
  // Use a transaction to ensure all related records are created
  return await db.transaction().execute(async (trx) => {
    // Create the expense group
    const expenseGroup = await trx.insertInto('expense_groups')
      .values({
        name: data.name,
        description: data.description || null,
        category: data.category,
        total_amount: data.total_amount,
      })
      .returningAll()
      .executeTakeFirst();

    if (!expenseGroup) {
      throw new Error('Failed to create expense group');
    }

    // Add participants
    for (const participant of data.participants) {
      await trx.insertInto('expense_participants')
        .values({
          expense_group_id: expenseGroup.id,
          user_id: participant.user_id,
          amount_owed: participant.amount_owed,
        })
        .execute();
    }

    return expenseGroup;
  });
}

// Add payment
export async function addPayment(data: {
  expense_group_id: number;
  user_id: number;
  amount: number;
  payment_method_id?: number;
}) {
  return db.insertInto('payments')
    .values({
      expense_group_id: data.expense_group_id,
      user_id: data.user_id,
      amount: data.amount,
      payment_method_id: data.payment_method_id || null,
    })
    .returningAll()
    .executeTakeFirst();
}

// Add payment method
export async function addPaymentMethod(data: {
  user_id: number;
  type: string;
  last_four: string;
  provider: string;
  is_default?: boolean;
}) {
  return db.insertInto('payment_methods')
    .values({
      user_id: data.user_id,
      type: data.type,
      last_four: data.last_four,
      provider: data.provider,
      is_default: data.is_default ? 1 : 0,
    })
    .returningAll()
    .executeTakeFirst();
}

// Get payment methods for user
export async function getUserPaymentMethods(userId: number) {
  return db.selectFrom('payment_methods')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('is_default', 'desc')
    .execute();
}

// Generate a unique invite code
function generateInviteCode() {
  return crypto.randomBytes(6).toString('hex');
}

// Create an invite for an expense group
export async function createExpenseInvite(data: {
  expense_group_id: number;
  created_by: number;
  expires_in_hours?: number;
}) {
  const invite_code = generateInviteCode();
  
  // Calculate expiry date if provided
  let expires_at = null;
  if (data.expires_in_hours) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + data.expires_in_hours);
    expires_at = expiryDate.toISOString();
  }
  
  return db.insertInto('expense_invites')
    .values({
      expense_group_id: data.expense_group_id,
      invite_code,
      created_by: data.created_by,
      expires_at,
    })
    .returningAll()
    .executeTakeFirst();
}

// Get invite details by code
export async function getInviteByCode(inviteCode: string) {
  // Get the invite with expense group details
  const invite = await db.selectFrom('expense_invites')
    .innerJoin('expense_groups', 'expense_groups.id', 'expense_invites.expense_group_id')
    .innerJoin('users', 'users.id', 'expense_invites.created_by')
    .select([
      'expense_invites.id',
      'expense_invites.invite_code',
      'expense_invites.expense_group_id',
      'expense_invites.created_by',
      'expense_invites.created_at',
      'expense_invites.expires_at',
      'expense_invites.used_by',
      'expense_invites.used_at',
      'expense_groups.name as expense_group_name',
      'expense_groups.category as expense_group_category',
      'users.name as created_by_name'
    ])
    .where('expense_invites.invite_code', '=', inviteCode)
    .executeTakeFirst();
  
  if (!invite) {
    return null;
  }
  
  // Check if invite has expired
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { ...invite, expired: true };
  }
  
  // Check if invite has been used
  if (invite.used_by) {
    return { ...invite, used: true };
  }
  
  return { ...invite, expired: false, used: false };
}

// Use an invite to join an expense group
export async function useInvite(data: {
  invite_code: string;
  user_id: number;
  amount_owed?: number;
}) {
  return await db.transaction().execute(async (trx) => {
    // Get the invite
    const invite = await trx.selectFrom('expense_invites')
      .selectAll()
      .where('invite_code', '=', data.invite_code)
      .executeTakeFirst();
    
    if (!invite) {
      throw new Error('Invite not found');
    }
    
    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new Error('Invite has expired');
    }
    
    // Check if invite is already used
    if (invite.used_by) {
      throw new Error('Invite has already been used');
    }
    
    // Check if user is already a participant
    const existingParticipant = await trx.selectFrom('expense_participants')
      .selectAll()
      .where('expense_group_id', '=', invite.expense_group_id)
      .where('user_id', '=', data.user_id)
      .executeTakeFirst();
    
    if (existingParticipant) {
      throw new Error('User is already a participant in this expense group');
    }
    
    // Add user to expense group
    await trx.insertInto('expense_participants')
      .values({
        expense_group_id: invite.expense_group_id,
        user_id: data.user_id,
        amount_owed: data.amount_owed || 0,
      })
      .execute();
    
    // Mark invite as used
    await trx.updateTable('expense_invites')
      .set({
        used_by: data.user_id,
        used_at: new Date().toISOString(),
      })
      .where('id', '=', invite.id)
      .execute();
    
    return invite.expense_group_id;
  });
}

// Get active invites for an expense group
export async function getActiveInvites(expenseGroupId: number) {
  return db.selectFrom('expense_invites')
    .innerJoin('users', 'users.id', 'expense_invites.created_by')
    .select([
      'expense_invites.id',
      'expense_invites.invite_code',
      'expense_invites.created_at',
      'expense_invites.expires_at',
      'expense_invites.used_by',
      'expense_invites.used_at',
      'users.name as created_by_name'
    ])
    .where('expense_invites.expense_group_id', '=', expenseGroupId)
    .where(eb => eb.or([
      eb('expense_invites.used_by', 'is', null),
      eb('expense_invites.created_at', '>', db.raw("datetime('now', '-1 day')"))
    ]))
    .where(eb => eb.or([
      eb('expense_invites.expires_at', 'is', null),
      eb('expense_invites.expires_at', '>', db.raw("datetime('now')"))
    ]))
    .orderBy('expense_invites.created_at', 'desc')
    .execute();
}
