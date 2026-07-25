import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const maintenanceOfficers = await prisma.user.findMany({
      where: { role: 'MAINTENANCE' },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    return NextResponse.json(maintenanceOfficers);
  } catch (error) {
    console.error('Error fetching maintenance officers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
