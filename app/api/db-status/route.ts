import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Проверка подключения
    await prisma.$queryRaw`SELECT 1`;
    // Получение размера БД (Postgres)
    const sizeResult = await prisma.$queryRawUnsafe<any>(
      `SELECT pg_database_size(current_database()) as size;`
    );
    let size = sizeResult?.[0]?.size || 0;
    if (typeof size === 'bigint') size = Number(size);
    // Время последнего бэкапа (заглушка)
    const lastBackup = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 часа назад
    return NextResponse.json({
      status: 'healthy',
      size,
      lastBackup,
    });
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      size: 0,
      lastBackup: null,
      error: e?.message || String(e)
    }, { status: 500 });
  }
} 