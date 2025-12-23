import { NextRequest, NextResponse } from 'next/server';
import { getPosts, savePost, deletePost } from '@/lib/markdown';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'stories' | 'blogs';

  if (!type || (type !== 'stories' && type !== 'blogs')) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const posts = await getPosts(type);
  
  // Add caching headers for better performance
  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, content, date, excerpt, image } = body;

    if (!type || (type !== 'stories' && type !== 'blogs')) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    await savePost(type, slug, title, content, date, excerpt, image);

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'stories' | 'blogs';
    const slug = searchParams.get('slug');

    if (!type || (type !== 'stories' && type !== 'blogs')) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    await deletePost(type, slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

