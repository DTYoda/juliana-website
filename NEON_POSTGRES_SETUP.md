# Neon Postgres Setup Guide

This guide will help you set up Neon Postgres for your website so that posts and website content can be created and updated in real-time without redeploying.

## Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech) (or create via Vercel Marketplace)
2. Sign up/Login to Neon
3. Click **Create Project**
4. Choose a project name (e.g., `juliana-website`)
5. Select a region (choose closest to your users)
6. Click **Create Project**

## Step 2: Get Connection String

After creating the database:

1. In your Neon project dashboard, go to **Connection Details**
2. Copy the **Connection String** (it looks like: `postgresql://user:password@host/database?sslmode=require`)
3. This is your `DATABASE_URL`

## Step 3: Run Database Schema

1. In Neon dashboard, go to **SQL Editor**
2. Open the file `scripts/schema.sql` from this project
3. Copy and paste the entire SQL into the SQL Editor
4. Click **Run** to execute the schema
5. Verify tables were created:
   - `posts` table
   - `website_content` table

Alternatively, you can use the Neon CLI or connect via psql:
```bash
psql "your-connection-string" -f scripts/schema.sql
```

## Step 4: Add Environment Variable to Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string (from Step 2)
3. Make sure to add it to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **Save**

## Step 5: Update Local Environment Variables

Add the `DATABASE_URL` to your local `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
ADMIN_PASSWORD_HASH=9715c2bb7e1a796147cedfccf4cb24ec1967b10063ebf52f5f1cc591814de6e8
```

**Important**: Never commit `.env.local` to git! It should already be in `.gitignore`.

## Step 6: Migrate Existing Data (One-Time)

Before deploying, migrate your existing posts and website content to Postgres:

1. Make sure your `.env.local` has `DATABASE_URL` set
2. Run the migration script:

```bash
npx tsx scripts/migrate-to-postgres.ts
```

**Note**: The script automatically loads your `.env.local` file, so you don't need to manually set environment variables.

This will:
- Migrate all existing stories from `content/stories/` to Postgres
- Migrate all existing blogs from `content/blogs/` to Postgres
- Migrate website content from `content/website-content.json` to Postgres

## Step 7: Deploy to Vercel

1. Commit and push your changes to GitHub
2. Vercel will automatically deploy
3. The `DATABASE_URL` environment variable you added in Step 4 will be available in production

## Step 8: Verify Everything Works

1. Go to your deployed website
2. Log into the admin panel (`/admin`)
3. Try creating a new story or blog post
4. Verify it appears immediately (no redeploy needed!)
5. Try editing website content
6. Verify changes appear immediately

## Troubleshooting

### "DATABASE_URL is not set" error

- Make sure environment variable is set in Vercel
- Check that variable name is exactly `DATABASE_URL` (case-sensitive)
- Redeploy after adding environment variables

### Migration script fails

- Verify `.env.local` has correct `DATABASE_URL`
- Check that `content/` directory exists with your data
- Make sure database schema was run (Step 3)
- Check Neon dashboard for connection issues

### Posts not appearing after migration

- Check Neon dashboard → SQL Editor to query: `SELECT * FROM posts;`
- Verify environment variables are set correctly
- Check browser console for errors
- Verify database schema was created correctly

### Connection timeout errors

- Check Neon dashboard for database status
- Verify connection string is correct
- Make sure database is not paused (Neon pauses inactive databases)
- Check network/firewall settings

## What Changed?

- ✅ **Posts (stories/blogs)**: Now stored in Neon Postgres instead of markdown files
- ✅ **Website Content**: Now stored in Postgres JSONB column instead of JSON file
- ✅ **Real-time Updates**: Changes appear immediately without redeploy
- ✅ **Same Interface**: Admin panel and user experience remain identical
- ✅ **Formatting Preserved**: All markdown formatting works exactly the same
- ✅ **Better Performance**: Single efficient queries instead of N+1 patterns

## Database Schema

The database has two main tables:

### `posts` table
- Stores all stories and blog posts
- Fields: `id`, `type`, `slug`, `title`, `content` (markdown), `date`, `excerpt`, `image`, `created_at`, `updated_at`
- Indexed on `type` + `date` for fast queries
- Unique constraint on `slug`

### `website_content` table
- Stores website configuration as JSONB
- Single row with `id = 1`
- Fields: `id`, `content` (JSONB), `updated_at`

## Notes

- The old `content/` directory files are still there but no longer used
- You can delete them after verifying everything works in production
- All new posts and edits go directly to Postgres
- The migration script is safe to run multiple times (it will update existing posts)
- Neon has a generous free tier: 0.5GB storage, 10 hours compute/month

## Future Enhancements

With Postgres, you can easily add:
- Full-text search for posts
- Filtering by date range, tags, categories
- Post analytics (views, popularity)
- User comments (with relationships)
- Advanced queries and aggregations

