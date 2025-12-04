import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const serviceItems = await prisma.serviceItem.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return NextResponse.json({ serviceItems });
  } catch (error) {
    console.error("Error fetching service items:", error);
    return NextResponse.json(
      { error: "Failed to fetch service items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Проверяем, что услуга с таким кодом не существует
    const existingServiceItem = await prisma.serviceItem.findUnique({
      where: { code: body.code },
    });
    
    if (existingServiceItem) {
      return NextResponse.json(
        { error: "Услуга с таким кодом уже существует" },
        { status: 400 }
      );
    }
    
    const serviceItem = await prisma.serviceItem.create({
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
    console.error("Error creating service item:", error);
    return NextResponse.json(
      { error: "Failed to create service item" },
      { status: 500 }
    );
  }
}