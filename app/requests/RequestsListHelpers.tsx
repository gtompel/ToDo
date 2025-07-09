import { Badge } from "@/components/ui/badge"

export const STATUS_OPTIONS = [
  { value: "OPEN", label: "Открыт" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "RESOLVED", label: "Решен" },
  { value: "CLOSED", label: "Закрыт" },
]
export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Низкий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "HIGH", label: "Высокий" },
  { value: "CRITICAL", label: "Критический" },
]

export function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <Badge variant="destructive">Открыт</Badge>
    case "IN_PROGRESS":
      return <Badge variant="secondary">В работе</Badge>
    case "RESOLVED":
      return <Badge variant="default">Решен</Badge>
    case "CLOSED":
      return <Badge variant="outline">Закрыт</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return <Badge variant="destructive">Высокий</Badge>
    case "MEDIUM":
      return <Badge variant="secondary">Средний</Badge>
    case "LOW":
      return <Badge variant="outline">Низкий</Badge>
    default:
      return <Badge>{priority}</Badge>
  }
}

export function renderRequestDetails(description: string) {
  let data: any = null
  try {
    data = JSON.parse(description)
  } catch {
    return <p className="text-gray-700 mb-4">{description}</p>
  }
  return (
    <div className="mb-4">
      <table className="text-sm w-full">
        <tbody>
          <tr><td className="font-medium pr-2">ФИО:</td><td>{data.fullName}</td></tr>
          <tr><td className="font-medium pr-2">Подразделение:</td><td>{data.department}</td></tr>
          <tr><td className="font-medium pr-2">Должность:</td><td>{data.position}</td></tr>
          <tr><td className="font-medium pr-2">Здание/помещение:</td><td>{data.building} / {data.room}</td></tr>
          <tr><td className="font-medium pr-2">Оборудование:</td><td>{data.deviceType} {data.manufacturer} {data.model} (S/N: {data.serialNumber})</td></tr>
          <tr><td className="font-medium pr-2">Монитор:</td><td>{data.monitorManufacturer} {data.monitorModel} (S/N: {data.monitorSerial})</td></tr>
          <tr><td className="font-medium pr-2">ОС:</td><td>{data.operatingSystem}</td></tr>
          <tr><td className="font-medium pr-2">Доп. ПО:</td><td>{data.additionalSoftware}</td></tr>
          <tr><td className="font-medium pr-2">Флеш-носитель:</td><td>{data.flashDrive}</td></tr>
          <tr><td className="font-medium pr-2">Доп. требования:</td><td>
            {data.needsEMVS && <span>ЕМВС; </span>}
            {data.needsSKZI && <span>СКЗИ; </span>}
            {data.needsRosatomAccess && <span>Росатом; </span>}
            {!data.needsEMVS && !data.needsSKZI && !data.needsRosatomAccess && <span>нет</span>}
          </td></tr>
          {data.additionalInfo && <tr><td className="font-medium pr-2">Доп. информация:</td><td>{data.additionalInfo}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function formatRequestId(id: string) {
  return `KB-${id.slice(-3).toUpperCase()}`
} 