# Vercel Blob Storage Setup Guide

This guide will help you set up Vercel Blob Storage for image uploads and storage, replacing the filesystem-based approach.

## Step 1: Create Vercel Blob Storage

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (juliana-website)
3. Navigate to the **Storage** tab
4. Click **Create Database**
5. Select **Blob**
6. Choose a name for your storage (e.g., `juliana-images`)
7. Select a region (choose closest to your users)
8. Click **Create**

## Step 2: Get Blob Token

After creating the Blob storage:

1. In the Storage tab, click on your Blob storage
2. Go to the **.env.local** tab
3. Copy the `BLOB_READ_WRITE_TOKEN` value

## Step 3: Add Environment Variable to Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your token from Step 2
3. Make sure to add it to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **Save**

## Step 4: Update Local Environment Variables

Add the token to your local `.env.local` file:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
DATABASE_URL=your-neon-url
ADMIN_PASSWORD_HASH=your-hash
```

## Step 5: Migrate Existing Images (Optional)

If you have existing images in `/public/uploads/`, migrate them to Blob Storage:

```bash
npx tsx scripts/migrate-images-to-blob.ts
```

This script will:
- Upload all images from `/public/uploads/` to Vercel Blob
- Update database references (posts and website content) to use new Blob URLs
- Preserve all existing image associations

**Note**: After migration, you can optionally delete the `/public/uploads/` folder since images are now in Blob Storage.

## Step 6: Deploy to Vercel

1. Commit and push your changes to GitHub
2. Vercel will automatically deploy
3. The `BLOB_READ_WRITE_TOKEN` environment variable will be available in production

## Step 7: Test Image Uploads

1. Go to your deployed website
2. Log into the admin panel (`/admin`)
3. Try uploading an image when creating/editing a post
4. Verify the image appears correctly
5. Check that the image URL is a Vercel Blob URL (e.g., `https://*.public.blob.vercel-storage.com/...`)

## Image Optimization

The implementation uses Next.js `Image` component for automatic optimization:

- ✅ **Automatic format optimization** (WebP, AVIF when supported)
- ✅ **Responsive images** (different sizes for different screens)
- ✅ **Lazy loading** (images load as you scroll)
- ✅ **CDN delivery** (Vercel Blob includes global CDN)
- ✅ **Proper sizing** (prevents layout shift)

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not set" error

- Make sure environment variable is set in Vercel
- Check that variable name is exactly `BLOB_READ_WRITE_TOKEN` (case-sensitive)
- Redeploy after adding environment variables

### Migration script fails

- Verify `.env.local` has correct `BLOB_READ_WRITE_TOKEN`
- Check that `/public/uploads/` directory exists with images
- Make sure you have write access to Blob Storage

### Images not displaying

- Check Next.js config allows Vercel Blob domains (already configured)
- Verify image URLs in database are full Blob URLs (not `/uploads/...`)
- Check browser console for image loading errors
- Ensure images are set to `access: 'public'` in upload API

### Upload fails

- Check file size (max 10MB configured)
- Verify file type (only images: jpg, png, gif, webp)
- Check Vercel Blob storage quota (free tier: 1GB)
- Verify `BLOB_READ_WRITE_TOKEN` is correct

## What Changed?

- ✅ **Image Storage**: Now stored in Vercel Blob instead of filesystem
- ✅ **Image URLs**: Full CDN URLs instead of local paths
- ✅ **Image Optimization**: Next.js Image component for automatic optimization
- ✅ **CDN Delivery**: Global CDN included with Vercel Blob
- ✅ **Real-time Uploads**: Images available immediately after upload

## Benefits

- **Works on Vercel**: No filesystem write issues
- **Fast Loading**: CDN delivery + Next.js optimization
- **Scalable**: Handles any number of images
- **Reliable**: Managed by Vercel infrastructure
- **Free Tier**: 1GB storage, 100GB bandwidth/month

## File Size Limits

- **Maximum file size**: 10MB per image (configured in upload API)
- **Supported formats**: JPEG, PNG, GIF, WebP
- **Automatic optimization**: Next.js converts to optimal formats

## Notes

- Old `/public/uploads/` images can be deleted after migration
- New uploads automatically go to Blob Storage
- Image URLs are stored in Postgres database
- All images are publicly accessible via CDN URLs
- Migration script is safe to run multiple times (won't duplicate)

