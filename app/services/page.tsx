import { prisma } from "@/lib/prisma";
import ServicesTableClient from "./ServicesTableClient";

export default async function ServicesPage() {
  // Получаем список сервисов с включенными связями
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

  return <ServicesTableClient services={formattedServices} />;
}