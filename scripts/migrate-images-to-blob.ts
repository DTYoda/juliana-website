/**
 * Migration script to upload existing images from /public/uploads to Vercel Blob Storage
 *
 * Run this script locally before deploying:
 * npx tsx scripts/migrate-images-to-blob.ts
 *
 * Make sure you have BLOB_READ_WRITE_TOKEN set in your .env.local file
 */

// CRITICAL: Load .env.local BEFORE any other imports
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { sql } from "../lib/db";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

interface ImageMapping {
  oldPath: string;
  newUrl: string;
}

async function migrateImagesToBlob(): Promise<ImageMapping[]> {
  console.log("🔄 Migrating images to Vercel Blob Storage...\n");

  if (!fs.existsSync(uploadsDir)) {
    console.log("⚠️  Uploads directory does not exist, skipping...");
    return [];
  }

  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log("📝 No image files found to migrate.");
    return [];
  }

  console.log(`📸 Found ${imageFiles.length} images to migrate...\n`);

  const mappings: ImageMapping[] = [];

  for (const file of imageFiles) {
    try {
      const filePath = path.join(uploadsDir, file);
      const buffer = fs.readFileSync(filePath);
      const filename = `uploads/${file}`;

      console.log(`  Uploading: ${file}...`);

      const blob = await put(filename, buffer, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN!,
      });

      mappings.push({
        oldPath: `/uploads/${file}`,
        newUrl: blob.url,
      });

      console.log(`  ✅ Migrated: ${file} → ${blob.url.substring(0, 50)}...`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate ${file}:`, error);
    }
  }

  return mappings;
}

async function updateDatabaseReferences(mappings: ImageMapping[]) {
  console.log("\n🔄 Updating database references...\n");

  if (mappings.length === 0) {
    console.log("⚠️  No mappings to update.");
    return;
  }

  // Update posts table
  try {
    const posts = await sql`
      SELECT id, slug, image
      FROM posts
      WHERE image IS NOT NULL AND image != ''
    ` as Array<{
      id: number;
      slug: string;
      image: string;
    }>;

    let updatedPosts = 0;
    for (const post of posts) {
      const mapping = mappings.find((m) => m.oldPath === post.image);
      if (mapping) {
        await sql`
          UPDATE posts
          SET image = ${mapping.newUrl}
          WHERE id = ${post.id}
        `;
        updatedPosts++;
        console.log(`  ✅ Updated post: ${post.slug}`);
      }
    }

    console.log(`\n✨ Updated ${updatedPosts} post image references`);
  } catch (error) {
    console.error("❌ Failed to update posts:", error);
  }

  // Update website_content JSONB
  try {
    const result = await sql`
      SELECT content
      FROM website_content
      WHERE id = 1
      LIMIT 1
    ` as Array<{
      content: any;
    }>;

    if (result.length > 0) {
      const content = result[0].content;
      let updated = false;

      // Update gallery images
      if (content.about?.galleryImages) {
        content.about.galleryImages = content.about.galleryImages.map(
          (img: string) => {
            const mapping = mappings.find((m) => m.oldPath === img);
            if (mapping) {
              updated = true;
              return mapping.newUrl;
            }
            return img;
          }
        );
      }

      // Update banner/profile images if they're in uploads
      if (content.home?.bannerImage?.startsWith("/uploads/")) {
        const mapping = mappings.find(
          (m) => m.oldPath === content.home.bannerImage
        );
        if (mapping) {
          content.home.bannerImage = mapping.newUrl;
          updated = true;
        }
      }

      if (content.home?.profileImage?.startsWith("/uploads/")) {
        const mapping = mappings.find(
          (m) => m.oldPath === content.home.profileImage
        );
        if (mapping) {
          content.home.profileImage = mapping.newUrl;
          updated = true;
        }
      }

      if (updated) {
        await sql`
          UPDATE website_content
          SET content = ${JSON.stringify(content)}::jsonb,
              updated_at = NOW()
          WHERE id = 1
        `;
        console.log("✅ Updated website content image references");
      }
    }
  } catch (error) {
    console.error("❌ Failed to update website content:", error);
  }
}

async function main() {
  console.log("🚀 Starting image migration to Vercel Blob...\n");
  console.log("=".repeat(50) + "\n");

  // Check for BLOB_READ_WRITE_TOKEN
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN environment variable is not set!");
    console.error("\nTroubleshooting:");
    console.error("1. Make sure .env.local exists in the project root");
    console.error("2. Verify BLOB_READ_WRITE_TOKEN is set in .env.local");
    console.error(
      "3. Get your token from Vercel Dashboard → Storage → Your Blob Store → .env.local tab"
    );
    process.exit(1);
  }

  console.log("✅ BLOB_READ_WRITE_TOKEN found\n");

  try {
    const mappings = await migrateImagesToBlob();
    await updateDatabaseReferences(mappings);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Verify images in Vercel Blob dashboard");
    console.log("2. Test image loading on your site");
    console.log("3. Optionally delete /public/uploads folder (images are now in Blob)");
    console.log("4. Deploy to Vercel");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
main();

