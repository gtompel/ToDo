import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const serviceItem = await prisma.serviceItem.findUnique({
      where: { id },
    });

    if (!serviceItem) {
      return NextResponse.json(
        { error: "Service item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ serviceItem });
  } catch (error) {
    console.error("Error fetching service item:", error);
    return NextResponse.json(
      { error: "Failed to fetch service item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Проверяем, что услуга существует
    const existingServiceItem = await prisma.serviceItem.findUnique({
      where: { id },
    });

    if (!existingServiceItem) {
      return NextResponse.json(
        { error: "Service item not found" },
        { status: 404 }
      );
    }

    // Проверяем, что нет другой услуги с таким же кодом
    const duplicateServiceItem = await prisma.serviceItem.findFirst({
      where: {
        code: body.code,
        NOT: {
          id: id,
        },
      },
    });

    if (duplicateServiceItem) {
      return NextResponse.json(
        { error: "Услуга с таким кодом уже существует" },
        { status: 400 }
      );
    }

    const serviceItem = await prisma.serviceItem.update({
      where: { id },
      data: {
        code: body.code,
        owner: body.owner,
        systemName: body.systemName,
        supportCode: body.supportCode,
        supportName: body.supportName,
        card: body.card,
        passport: body.passport,
        note: body.note,
      },
    });

    return NextResponse.json({ serviceItem });
  } catch (error) {
    console.error("Error updating service item:", error);
    return NextResponse.json(
      { error: "Failed to update service item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Проверяем, что услуга существует
    const existingServiceItem = await prisma.serviceItem.findUnique({
      where: { id },
    });

    if (!existingServiceItem) {
      return NextResponse.json(
        { error: "Service item not found" },
        { status: 404 }
      );
    }

    await prisma.serviceItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service item deleted successfully" });
  } catch (error) {
    console.error("Error deleting service item:", error);
    return NextResponse.json(
      { error: "Failed to delete service item" },
      { status: 500 }
    );
  }
}