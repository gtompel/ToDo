import { prisma } from "@/lib/prisma"
import WorkstationsTable from "./WorkstationsTableClient"

export default async function WorkstationsPage() {
  const workstations = await prisma.workstation.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } })
  return <WorkstationsTable workstations={workstations} />
}