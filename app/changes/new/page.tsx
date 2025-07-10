import { getUsers } from "@/lib/actions/users"
import NewChangePage from "./NewChangePageClient"

export default async function NewChangePageWrapper() {
  const users = await getUsers()
  return <NewChangePage users={users} />
}
