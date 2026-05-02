import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') ?? '30', 10);

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders,
      vendorPerformance,
      dailyOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: since } } }),

      prisma.order.aggregate({
        where:   { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
        _sum:    { totalPrice: true },
      }),

      prisma.order.groupBy({
        by:    ['status'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),

      prisma.order.findMany({
        where:   { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take:    10,
        include: {
          user:   { select: { name: true } },
          vendor: { select: { name: true } },
        },
      }),

      prisma.order.groupBy({
        by:    ['assignedVendorId'],
        where: { createdAt: { gte: since }, assignedVendorId: { not: null } },
        _count: { id: true },
        _sum:   { totalPrice: true },
      }),

      prisma.$queryRaw<Array<{ date: string; revenue: number; orders: bigint }>>`
        SELECT
          DATE("createdAt")::text AS date,
          COALESCE(SUM("totalPrice"), 0)::float AS revenue,
          COUNT(id) AS orders
        FROM "Order"
        WHERE "createdAt" >= ${since}
          AND status != 'CANCELLED'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    // Enrich vendor performance with names
    const vendorIds = vendorPerformance
      .map((v) => v.assignedVendorId)
      .filter(Boolean) as string[];

    const vendorNames = await prisma.vendor.findMany({
      where:  { id: { in: vendorIds } },
      select: { id: true, name: true },
    });

    const nameMap = Object.fromEntries(vendorNames.map((v) => [v.id, v.name]));

    const enrichedVendors = vendorPerformance.map((v) => ({
      vendorId:    v.assignedVendorId,
      vendorName:  nameMap[v.assignedVendorId!] ?? 'Unknown',
      totalOrders: v._count.id,
      revenue:     v._sum.totalPrice ?? 0,
    }));

    return NextResponse.json({
      data: {
        totalOrders,
        totalRevenue:  totalRevenue._sum.totalPrice ?? 0,
        ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count.id })),
        recentOrders,
        vendorPerformance: enrichedVendors,
        dailyOrders: dailyOrders.map((d) => ({
          date:    d.date,
          revenue: d.revenue,
          orders:  Number(d.orders),
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
