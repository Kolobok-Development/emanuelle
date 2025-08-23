# Prisma + Supabase Setup Guide

## 1. Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Database Connection (REQUIRED for Prisma)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Public Keys (for client-side)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[YOUR-PUBLISHABLE-KEY]"

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

## 2. Get Your Supabase Database Connection String

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Find the "Connection string" section
4. Copy the "URI" connection string
5. Replace `[YOUR-PASSWORD]` with your database password
6. Replace `[YOUR-PROJECT-REF]` with your project reference ID

## 3. Initialize Prisma

Run these commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

## 4. Verify Connection

After running `npx prisma db push`, you should see your tables created in your Supabase database.

## 5. Usage in Your Code

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Get all users
const users = await prisma.users.findMany()

// Example: Create a new user
const newUser = await prisma.users.create({
  data: {
    telegram_id: 123456789,
    username: 'test_user',
    isTermsPolicyAccepted: true
  }
})
```

## Troubleshooting

- **Connection Error**: Make sure your `DATABASE_URL` is correct and your IP is whitelisted in Supabase
- **Schema Push Error**: Ensure your database user has the necessary permissions
- **Client Generation Error**: Run `npx prisma generate` after any schema changes

