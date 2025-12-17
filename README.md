# Juliana's Writing Website

A cozy, feminine personal website for a writer featuring a writing portfolio, blog posts, and an admin panel for content management.

## Features

- **Writing Portfolio**: Showcase your stories and creative writing pieces
- **Blog Section**: Share thoughts, reflections, and musings
- **About Page**: Personal introduction and writer's story
- **Admin Panel**: Create, edit, and delete stories and blog posts
- **Markdown Support**: All content is stored as markdown files for easy editing
- **Beautiful Design**: Cozy, feminine aesthetic with cyan accents

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the website.

## Content Management

### Adding Content via Admin Panel

1. Navigate to `/admin` in your browser
2. Choose between "Stories" or "Blog Posts" tabs
3. Click "New Story" or "New Post" to create content
4. Fill in the title, date, excerpt (optional), and content (markdown)
5. Click "Save" to create the post

### Editing Content

1. Go to `/admin`
2. Click "Edit" on any existing story or blog post
3. Make your changes
4. Click "Save" to update

### Manual Content Management

Content is stored in markdown files in the `content/` directory:
- Stories: `content/stories/*.md`
- Blog posts: `content/blogs/*.md`

Each markdown file should have front matter at the top:

```markdown
---
title: "Your Title Here"
date: 2024-01-15T00:00:00.000Z
excerpt: "Optional excerpt for previews"
---

Your content here in markdown format...
```

## Project Structure

```
├── app/
│   ├── about/          # About page
│   ├── admin/          # Admin panel
│   ├── blog/           # Blog listing and posts
│   ├── portfolio/      # Portfolio listing and stories
│   └── api/            # API routes for admin operations
├── components/         # React components
├── content/            # Markdown files
│   ├── stories/        # Story markdown files
│   └── blogs/          # Blog post markdown files
└── lib/                # Utility functions
    ├── markdown.ts     # Markdown parsing utilities
    └── utils.ts        # Helper functions
```

## Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling with custom design system
- **gray-matter**: Front matter parsing
- **remark**: Markdown processing
- **date-fns**: Date formatting

## Design

The website features a cozy, feminine design with:
- Soft rose and cyan color palette
- Playfair Display font for headings (serif, elegant)
- Inter font for body text (clean, readable)
- Gradient backgrounds and soft shadows
- Rounded corners and gentle transitions

## Building for Production

```bash
npm run build
npm start
```

## License

Private project for personal use.
