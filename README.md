# ✍️ Juliana's Writing Portfolio Website

A beautiful, modern personal writing portfolio showcasing stories, blog posts, and creative writing. Built with Next.js and featuring a powerful admin panel for seamless content management.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

A cozy, elegant writing portfolio website featuring a writing portfolio, blog section, and comprehensive admin panel. Built with modern web technologies and optimized for performance, accessibility, and mobile responsiveness.

---

## ✨ Features

- ✅ **Responsive Design** - Beautiful, mobile-first design that works seamlessly on desktop, tablet, and mobile devices
- ✅ **Writing Portfolio** - Showcase creative stories and writing pieces with featured images and excerpts
- ✅ **Blog Section** - Share thoughts, reflections, and musings with a clean, readable layout
- ✅ **Admin Panel** - Powerful content management system with rich text editor for creating and editing posts
- ✅ **Dark Mode** - Elegant light and dark theme toggle for comfortable reading in any environment
- ✅ **Real-time Updates** - Content changes reflect immediately across the site with optimized caching
- ✅ **Image Management** - Upload and manage images seamlessly with Vercel Blob storage
- ✅ **SEO Optimized** - Built-in SEO features and optimized performance for fast page loads

---

## 🛠️ Tech Stack

### Frontend/Backend
- **Next.js 16** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development for better code quality
- **Tailwind CSS 4** - Utility-first CSS framework with custom design system
- **React 19** - Latest React features and performance improvements

### Database & Storage
- **Neon PostgreSQL** - Serverless PostgreSQL database for content storage
- **Vercel Blob** - Serverless object storage for images and media

### Content Management
- **TipTap** - Rich text editor for content creation
- **Remark** - Markdown processing and conversion
- **Rehype** - HTML processing and sanitization

### Hosting & Deployment
- **Vercel** - Serverless hosting with edge functions and automatic deployments

### Other Tools
- **Git** - Version control
- **GitHub** - Code repository
- **date-fns** - Date formatting utilities

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Git](https://git-scm.com/)
- PostgreSQL database (Neon recommended for production)
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/juliana-website.git
   cd juliana-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=your_neon_postgres_connection_string
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
   ```

4. **Set up the database**
   
   Run the migration script to create the necessary tables:
   ```bash
   npm run migrate
   ```
   
   Or manually run the SQL schema from `scripts/schema.sql` in your PostgreSQL database.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser to see the website.

---

## 📝 Content Management

### Using the Admin Panel

1. Navigate to `/admin` in your browser
2. Log in with your admin password
3. Choose between **Stories** or **Blog Posts** tabs
4. Click **+ New Story** or **+ New Post** to create content
5. Use the rich text editor to write your content
6. Add featured images, excerpts, and metadata
7. Click **Save** to publish your content

### Website Content Management

- Navigate to the **Website Content** tab in the admin panel
- Edit home page, about page, portfolio, and blog page content
- Update navbar titles, descriptions, and gallery images
- All changes are saved to the database and reflect immediately

---

## 🎨 Design Features

The website features a cozy, elegant design with:

- **Color Palette** - Soft rose and cyan accents with gradient backgrounds
- **Typography** - Playfair Display for headings (elegant serif) and Inter for body text (clean sans-serif)
- **Animations** - Smooth scroll-based animations and transitions
- **Dark Mode** - Complete dark theme support with automatic system preference detection
- **Mobile Responsive** - Optimized layouts for all screen sizes

---

## 📦 Project Structure

```
├── app/
│   ├── about/              # About page
│   ├── admin/              # Admin panel and login
│   ├── api/                # API routes for content management
│   ├── blog/               # Blog listing and individual posts
│   ├── portfolio/          # Portfolio listing and individual stories
│   └── layout.tsx          # Root layout with navigation
├── components/
│   ├── AnimatedSection.tsx # Scroll animations
│   ├── DarkModeToggle.tsx  # Theme switcher
│   ├── Navigation.tsx      # Main navigation component
│   ├── RichTextEditor.tsx  # Content editor
│   └── ThemeProvider.tsx   # Theme context provider
├── lib/
│   ├── db.ts               # Database connection
│   ├── postgres-storage.ts # Post storage functions
│   ├── postgres-website-content.ts # Website content functions
│   └── markdown-processor.ts # Markdown processing
├── scripts/
│   ├── schema.sql          # Database schema
│   └── migrate-to-postgres.ts # Migration script
└── public/                 # Static assets
```

---

## 🌐 Live Demo

👉 **[View Live Website](https://your-website-url.vercel.app)**

---

## 🔧 Building for Production

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

For deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

---

## 📚 Documentation

- [Neon Postgres Setup Guide](./NEON_POSTGRES_SETUP.md) - Database configuration
- [Vercel Blob Setup Guide](./VERCEL_BLOB_SETUP.md) - Image storage setup
- [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md) - Performance improvements

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## 📄 License

Private project for personal use.

---

## 💬 Contact

**Juliana Karas** - Writer & Storyteller

- Website: [Your Website URL](https://your-website-url.vercel.app)
- Email: [your-email@example.com](mailto:your-email@example.com)

---

Made with ❤️ using Next.js and Tailwind CSS
