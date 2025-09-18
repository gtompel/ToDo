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
      return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Открыт</span>
    case "IN_PROGRESS":
      return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">В работе</span>
    case "RESOLVED":
      return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Решен</span>
    case "CLOSED":
      return <span className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs">Закрыт</span>
    default:
      return <span className="px-2 py-1 rounded bg-muted text-foreground text-xs">{status}</span>
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
  let data: unknown = null
  try {
    data = JSON.parse(description)
  } catch {
    return <p className="text-gray-700 mb-4">{description}</p>
  }

  if (!data || typeof data !== 'object') {
    return <p className="text-gray-700 mb-4">{String(description)}</p>
  }

  const obj = data as Record<string, unknown>

  const labelMap: Record<string, string> = {
    fullName: 'ФИО',
    department: 'Подразделение',
    position: 'Должность',
    building: 'Здание',
    room: 'Помещение',
    deviceType: 'Тип устройства',
    manufacturer: 'Производитель',
    model: 'Модель',
    serialNumber: 'Серийный номер',
    monitorManufacturer: 'Произв. монитора',
    monitorModel: 'Модель монитора',
    monitorSerial: 'Серийный монитора',
    operatingSystem: 'ОС',
    additionalSoftware: 'Доп. ПО',
    flashDrive: 'Флеш-носитель',
    additionalInfo: 'Доп. информация',
    needsEMVS: 'Нужен ЭМВС',
    needsSKZI: 'Нужно СКЗИ',
    needsRosatomAccess: 'Доступ Росатом',
    url: 'Ссылка на ресурс',
  }

  const entries = Object.entries(obj).filter(([k, v]) => {
    if (k === 'attachments' || k === 'acknowledgmentFile') return false
    return v !== undefined && v !== null && v !== ""
  })

  if (entries.length === 0) return null

  const building = obj['building'] as string | undefined
  const room = obj['room'] as string | undefined

  return (
    <div className="mb-4">
      <table className="text-sm w-full">
        <tbody>
          {entries.map(([key, value]) => {
            if (typeof value === 'boolean') {
              return (
                <tr key={key}><td className="font-medium pr-2">{labelMap[key] || key}:</td><td>{value ? 'Да' : 'Нет'}</td></tr>
              )
            }
            if (key === 'building' || key === 'room') {
              return null
            }
            if (key === 'url') {
              return (
                <tr key={key}><td className="font-medium pr-2">{labelMap[key]}:</td><td><a className="underline text-blue-700" href={String(value)} target="_blank" rel="noreferrer">{String(value)}</a></td></tr>
              )
            }
            return (
              <tr key={key}><td className="font-medium pr-2">{labelMap[key] || key}:</td><td>{String(value)}</td></tr>
            )
          })}
          {building || room ? (
            <tr key="buildingRoom"><td className="font-medium pr-2">Здание/помещение:</td><td>{[building, room].filter(Boolean).join(' / ')}</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

export function formatRequestId(id: string) {
  return `KB-${id.slice(-3).toUpperCase()}`
} 