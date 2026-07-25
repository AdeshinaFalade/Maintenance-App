import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { maintenanceId } = await req.json();
    const resolvedParams = await params;
    const requestId = resolvedParams.id;

    if (!maintenanceId) {
      return NextResponse.json({ message: 'Maintenance Officer ID is required' }, { status: 400 });
    }

    // Assign in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create or update assignment
      const assignment = await prisma.assignment.upsert({
        where: { requestId },
        update: { maintenanceId },
        create: { requestId, maintenanceId }
      });

      // Update request status to IN_PROGRESS
      const request = await prisma.serviceRequest.update({
        where: { id: requestId },
        data: { status: 'IN_PROGRESS' }
      });

      // Add a status update log
      await prisma.statusUpdate.create({
        data: {
          status: 'IN_PROGRESS',
          comment: 'Assigned to maintenance officer',
          requestId: requestId,
          updaterId: (session.user as any).id
        }
      });

      return { assignment, request };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error assigning request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
