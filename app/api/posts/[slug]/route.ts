import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, savePost } from '@/lib/markdown';
import { slugify } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'stories' | 'blogs';

  if (!type || (type !== 'stories' && type !== 'blogs')) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const post = await getPostBySlug(type, slug);
  
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: oldSlug } = await params;
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

    const newSlug = slugify(title);
    
    // If slug changed, we need to delete the old post and create a new one
    if (oldSlug !== newSlug) {
      const { deletePost } = await import('@/lib/markdown');
      await deletePost(type, oldSlug);
    }

    await savePost(type, newSlug, title, content, date, excerpt, image);

    return NextResponse.json({ success: true, slug: newSlug });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

