import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        backupStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Форматируем данные для фронтенда
    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      responsibleId: service.responsibleId,
      responsible: {
        id: service.responsible.id,
        name: `${service.responsible.lastName} ${service.responsible.firstName}`,
        email: service.responsible.email,
        position: service.responsible.position,
      },
      backupStaff: service.backupStaff.map(staff => ({
        id: staff.id,
        name: `${staff.lastName} ${staff.firstName}`,
        email: staff.email,
      })),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    return NextResponse.json({ services: formattedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Проверяем, что сервис с таким именем не существует
    const existingService = await prisma.service.findUnique({
      where: { name: body.name },
    });
    
    if (existingService) {
      return NextResponse.json(
        { error: "Сервис с таким именем уже существует" },
        { status: 400 }
      );
    }
    
    const service = await prisma.service.create({
      data: {
        name: body.name,
        description: body.description,
        responsibleId: body.responsibleId,
        backupStaff: {
          connect: body.backupStaffIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        backupStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Форматируем данные для фронтенда
    const formattedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      responsibleId: service.responsibleId,
      responsible: {
        id: service.responsible.id,
        name: `${service.responsible.lastName} ${service.responsible.firstName}`,
        email: service.responsible.email,
        position: service.responsible.position,
      },
      backupStaff: service.backupStaff.map(staff => ({
        id: staff.id,
        name: `${staff.lastName} ${staff.firstName}`,
        email: staff.email,
      })),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };

    return NextResponse.json({ service: formattedService });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}