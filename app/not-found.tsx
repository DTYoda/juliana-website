import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-cyan-500 dark:text-cyan-400 mb-4">404</h1>
        <p className="text-xl text-rose-400 dark:text-rose-500 mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block bg-cyan-500 dark:bg-cyan-600 text-white px-8 py-3 rounded-full hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors font-medium"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

