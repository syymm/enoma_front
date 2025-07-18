import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isPublic = searchParams.get('public') === 'true';
    const userId = searchParams.get('userId');
    
    // Check if user is admin for admin panel requests
    const payload = verifyJWT(request);
    const isAdminRequest = payload && payload.role === 'ADMIN' && !isPublic && !userId;
    
    const where: Record<string, any> = {};
    
    if (isPublic) {
      where.isPublic = true;
    } else if (userId) {
      where.userId = userId;
    } else if (isAdminRequest) {
      // Admin can see their own content (both public and private)
      where.userId = payload.userId;
    } else {
      // Default to public only for unauthorized requests
      where.isPublic = true;
    }

    const comics = await prisma.comic.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { episode: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ comics });
  } catch (error) {
    console.error('Error fetching comics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyJWT(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      thumbnail,
      imageUrl,
      color,
      price,
      episode,
      description,
      tags,
      isPublic = true
    } = body;

    if (!title || !thumbnail || !imageUrl || !color || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const comic = await prisma.comic.create({
      data: {
        title,
        thumbnail,
        imageUrls: imageUrl,
        color,
        price,
        episode,
        description,
        tags: tags || [],
        isPublic,
        userId: payload.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ comic }, { status: 201 });
  } catch (error) {
    console.error('Error creating comic:', error);
    return NextResponse.json(
      { error: 'Failed to create comic' },
      { status: 500 }
    );
  }
}