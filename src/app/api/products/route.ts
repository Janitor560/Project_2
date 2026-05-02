import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search   = searchParams.get('search');

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as never } : {}),
        ...(search   ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
