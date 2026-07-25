import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    const resolvedParams = await params;
    const requestId = resolvedParams.id;

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    // Verify the user is authorized to update this request
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole === 'MAINTENANCE') {
      // Ensure they are assigned to this request
      const assignment = await prisma.assignment.findUnique({
        where: { requestId }
      });

      if (!assignment || assignment.maintenanceId !== userId) {
        return NextResponse.json({ message: 'Not authorized to update this request' }, { status: 403 });
      }
    } else if (userRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Update the request status
    const result = await prisma.$transaction(async (prisma) => {
      const request = await prisma.serviceRequest.update({
        where: { id: requestId },
        data: { status }
      });

      // Log status update
      await prisma.statusUpdate.create({
        data: {
          status,
          comment: `Status updated to ${status}`,
          requestId,
          updaterId: userId
        }
      });

      return request;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
