import { getUsers } from "@/lib/actions/users";
import UsersPageClient from "./UsersPageClient";

export default async function UsersPage() {
  const initialUsers = await getUsers();
  return <UsersPageClient initialUsers={initialUsers} />;
}
