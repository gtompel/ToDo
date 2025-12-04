import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
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

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

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
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Проверяем, что сервис существует
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Проверяем, что нет другого сервиса с таким же именем
    const duplicateService = await prisma.service.findFirst({
      where: {
        name: body.name,
        NOT: {
          id: id,
        },
      },
    });

    if (duplicateService) {
      return NextResponse.json(
        { error: "Сервис с таким именем уже существует" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        responsibleId: body.responsibleId,
        backupStaff: {
          set: body.backupStaffIds?.map((id: string) => ({ id })) || [],
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
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Проверяем, что сервис существует
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}