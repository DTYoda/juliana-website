/**
 * Migration script to move existing posts and website content from filesystem to Neon Postgres
 *
 * Run this script locally before deploying to Vercel:
 * npx tsx scripts/migrate-to-postgres.ts
 *
 * Make sure you have DATABASE_URL set in your .env.local file
 */

// CRITICAL: Load .env.local BEFORE any other imports
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

// Now import other modules (they can safely use process.env.DATABASE_URL)
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { savePost } from "../lib/postgres-storage";
import { saveWebsiteContent } from "../lib/postgres-website-content";

const contentDirectory = path.join(process.cwd(), "content");

async function migratePosts() {
  console.log("🔄 Migrating posts to Postgres...\n");

  for (const type of ["stories", "blogs"] as const) {
    const fullPath = path.join(contentDirectory, type);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Directory ${type} does not exist, skipping...`);
      continue;
    }

    const fileNames = fs.readdirSync(fullPath);
    const mdFiles = fileNames.filter((name) => name.endsWith(".md"));

    if (mdFiles.length === 0) {
      console.log(`📝 No ${type} found to migrate.`);
      continue;
    }

    console.log(`📚 Migrating ${mdFiles.length} ${type}...`);

    for (const fileName of mdFiles) {
      try {
        const slug = fileName.replace(/\.md$/, "");
        const fullFilePath = path.join(fullPath, fileName);
        const fileContents = fs.readFileSync(fullFilePath, "utf8");
        const { data, content } = matter(fileContents);

        await savePost(
          type,
          slug,
          data.title || slug,
          content,
          data.date || new Date().toISOString(),
          data.excerpt || "",
          data.image || ""
        );

        console.log(`  ✅ Migrated: ${slug}`);
      } catch (error) {
        console.error(`  ❌ Failed to migrate ${fileName}:`, error);
      }
    }

    console.log(`\n✨ Completed migrating ${type}\n`);
  }
}

async function migrateWebsiteContent() {
  console.log("🔄 Migrating website content to Postgres...\n");

  const contentFile = path.join(contentDirectory, "website-content.json");

  if (!fs.existsSync(contentFile)) {
    console.log("⚠️  website-content.json does not exist, skipping...");
    return;
  }

  try {
    const fileContents = fs.readFileSync(contentFile, "utf-8");
    const content = JSON.parse(fileContents);

    // Validate structure
    if (!content.home || !content.about) {
      console.error("❌ Invalid website content structure");
      return;
    }

    await saveWebsiteContent(content);
    console.log("✅ Website content migrated successfully!\n");
  } catch (error) {
    console.error("❌ Failed to migrate website content:", error);
  }
}

async function main() {
  console.log("🚀 Starting migration to Neon Postgres...\n");
  console.log("=".repeat(50) + "\n");

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    console.error("\nTroubleshooting:");
    console.error("1. Make sure .env.local exists in the project root");
    console.error("2. Verify DATABASE_URL is set in .env.local");
    console.error(
      "3. Check that the .env.local file is not in .gitignore (it should be)"
    );
    console.error("\nExample .env.local format:");
    console.error(
      "DATABASE_URL=postgresql://user:password@host/database?sslmode=require"
    );
    process.exit(1);
  }

  console.log("✅ DATABASE_URL found");
  console.log(
    `   Connection: ${process.env.DATABASE_URL.substring(0, 30)}...\n`
  );

  try {
    await migratePosts();
    await migrateWebsiteContent();

    console.log("=".repeat(50));
    console.log("🎉 Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Verify your data in Neon dashboard");
    console.log("2. Deploy to Vercel");
    console.log("3. Test creating/editing posts in production");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
main();
