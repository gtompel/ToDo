import { prisma } from "@/lib/prisma"
import ITResourcesTable from "./ITResourcesTableClient"

export default async function ITResourcesPage() {
  const resources = await prisma.iTResource.findMany({ orderBy: { createdAt: "desc" } })
  return <ITResourcesTable resources={resources} />
} 