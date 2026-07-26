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
    const statusUpdates = await prisma.statusUpdate.findMany({
      include: {
        request: true,
        updater: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Create CSV header
    let csvContent = 'Date,Request ID,Request Title,Updated By,New Status,Comment\n';

    // Add rows
    statusUpdates.forEach((update) => {
      const date = new Date(update.updatedAt).toISOString();
      const reqId = update.request.id;
      const title = update.request.title.replace(/"/g, '""'); // Escape quotes
      const updatedBy = `${update.updater.firstName} ${update.updater.lastName}`.replace(/"/g, '""');
      const status = update.status;
      const comment = (update.comment || '').replace(/"/g, '""');

      csvContent += `"${date}","${reqId}","${title}","${updatedBy}","${status}","${comment}"\n`;
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit_trail.csv"',
      },
    });

  } catch (error) {
    console.error('Error exporting audit trail:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
