import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all requests (filtered by role)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  try {
    let requests;
    
    if (role === 'ADMIN') {
      // Admin sees all requests
      requests = await prisma.serviceRequest.findMany({
        include: { 
          submitter: true, 
          category: true, 
          assignment: { include: { maintenanceOfficer: true } },
          statusUpdates: { include: { updater: true }, orderBy: { updatedAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'MAINTENANCE') {
      // Maintenance sees assigned requests
      requests = await prisma.serviceRequest.findMany({
        where: {
          assignment: {
            maintenanceId: userId
          }
        },
        include: { submitter: true, category: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Student/Staff sees only their own requests
      requests = await prisma.serviceRequest.findMany({
        where: { submitterId: userId },
        include: { category: true, assignment: { include: { maintenanceOfficer: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST new request (Students/Staff)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { title, description, location, categoryId, evidenceUrl } = await req.json();

    if (!title || !description || !location || !categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Find or create the category by name
    let category = await prisma.category.findUnique({
      where: { name: categoryId } // categoryId from form is actually the name, e.g. "Plumbing"
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryId, description: `Auto-created category for ${categoryId}` }
      });
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        title,
        description,
        location,
        categoryId: category.id,
        evidenceUrl,
        submitterId: userId,
        status: 'PENDING'
      }
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
