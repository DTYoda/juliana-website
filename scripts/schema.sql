-- Database schema for Juliana Website
-- Run this script in your Neon database to create the required tables

-- Posts table (stories and blogs)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('stories', 'blogs')),
  slug VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  excerpt TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slug)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_type_date ON posts(type, date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Website content table (stores JSON configuration)
CREATE TABLE IF NOT EXISTS website_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

