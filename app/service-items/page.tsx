import ServiceItemsTableClient from "./ServiceItemsTableClient";

export default async function ServiceItemsPage() {
  // Передаем пустой массив, так как данные будут загружены на клиенте
  return <ServiceItemsTableClient serviceItems={[]} />;
}