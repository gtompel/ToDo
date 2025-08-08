"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, Circle, Bell } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-user"
import { useMemo } from "react"
import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { Switch } from "@/components/ui/switch"
import { addDays, startOfDay, subDays, isAfter } from "date-fns"

const TABS = [
  { key: "notifications", label: "Уведомления" },
  { key: "settings", label: "Настройки" },
  { key: "templates", label: "Шаблоны" },
  { key: "escalation", label: "Эскалация" },
]

const PAGE_SIZE = 10

export default function NotificationsCenterPage() {
  const [tab, setTab] = useState("notifications")
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState("")
  const [page, setPage] = useState(1)
  const { user: currentUser } = useCurrentUser()
  const isAdmin = currentUser?.role === "ADMIN"
  const [selected, setSelected] = useState<string[]>([])
  const selectAllRef = useRef<HTMLInputElement>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createUser, setCreateUser] = useState("")
  const [createTitle, setCreateTitle] = useState("")
  const [createMessage, setCreateMessage] = useState("")
  const [usersList, setUsersList] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const { toast } = useToast()
  const { confirm, dialog } = useConfirm()
  const userSelectRef = useRef<HTMLSelectElement>(null)
  const [createError, setCreateError] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkUsers, setBulkUsers] = useState<string[]>([])
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const now = new Date()
  let periodStart = new Date(0)
  if (period === 'today') periodStart = startOfDay(now)
  if (period === 'week') periodStart = startOfDay(subDays(now, 6))
  if (period === 'month') periodStart = startOfDay(subDays(now, 29))
  const filteredStats = notifications.filter(n => period === 'all' ? true : isAfter(new Date(n.createdAt), periodStart))
  const total = filteredStats.length
  const unread = filteredStats.filter(n => !n.read).length
  const read = filteredStats.filter(n => n.read).length

  // Состояния для настроек
  const defaultSettings = {
    emailNotifications: true,
    pushNotifications: true,
  }
  const [settings, setSettings] = useState<any>(defaultSettings)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  // Загрузка настроек при открытии вкладки
  useEffect(() => {
    if (tab !== "settings") return
    setSettingsLoading(true)
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => setSettings({ ...defaultSettings, ...(data.settings || {}) }))
      .finally(() => setSettingsLoading(false))
  }, [tab])
  // Сохранение настроек
  const saveSettings = async (patch: any) => {
    setSettingsSaving(true)
    const newSettings = { ...settings, ...patch }
    setSettings(newSettings)
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    })
    setSettingsSaving(false)
  }

  // mock-данные для каналов и параметров
  const [channels, setChannels] = useState([
    { key: 'email', label: 'Email', enabled: true },
    { key: 'push', label: 'Push', enabled: true },
  ])
  const [defaultEmail, setDefaultEmail] = useState(true)
  const [quietHours, setQuietHours] = useState(false)
  const [signature, setSignature] = useState('С уважением, ITSM')

  useEffect(() => {
    if (createOpen && userSelectRef.current) {
      userSelectRef.current.focus()
    }
    if (!createOpen) {
      setCreateUser("")
      setCreateTitle("")
      setCreateMessage("")
      setCreateError("")
      setUserSearch("")
    }
  }, [createOpen])

  useEffect(() => {
    if (!createOpen) {
      setPreviewMode(false)
      setBulkMode(false)
      setBulkUsers([])
    }
  }, [createOpen])

  useEffect(() => {
    if (tab !== "notifications") return
    setLoading(true)
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    if (isAdmin && createOpen && usersList.length === 0 && !usersLoading) {
      setUsersLoading(true)
      fetch("/api/users?role=USER,TECHNICIAN,MANAGER,ADMIN")
        .then(r => r.json())
        .then(data => setUsersList(data.users || []))
        .finally(() => setUsersLoading(false))
    }
  }, [isAdmin, createOpen, usersList.length, usersLoading])

  const handleCreate = async () => {
    setCreateError("")
    if (bulkMode) {
      if (bulkUsers.length === 0 || !createTitle || !createMessage) {
        setCreateError("Выберите хотя бы одного пользователя и заполните все поля")
        return
      }
      setCreateLoading(true)
      const results = await Promise.all(bulkUsers.map(userId =>
        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, title: createTitle, message: createMessage })
        })
      ))
      setCreateLoading(false)
      if (results.some(r => !r.ok)) {
        setCreateError("Ошибка при отправке части уведомлений")
        toast({ title: "Ошибка", description: "Не всем пользователям отправлено уведомление", variant: "destructive" })
      } else {
        setCreateOpen(false)
        setCreateUser("")
        setBulkUsers([])
        setCreateTitle("")
        setCreateMessage("")
        setCreateError("")
        refresh()
        toast({ title: "Успех", description: "Уведомления отправлены" })
      }
      return
    }
    if (!createUser || !createTitle || !createMessage) {
      setCreateError("Заполните все поля")
      return
    }
    setCreateLoading(true)
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: createUser, title: createTitle, message: createMessage })
    })
    setCreateLoading(false)
    if (!res.ok) {
      setCreateError("Ошибка создания уведомления")
      toast({ title: "Ошибка", description: "Не удалось создать уведомление", variant: "destructive" })
      return
    }
    setCreateOpen(false)
    setCreateUser("")
    setCreateTitle("")
    setCreateMessage("")
    setCreateError("")
    refresh()
    toast({ title: "Успех", description: "Уведомление создано" })
  }

  const filtered = useMemo(() => notifications.filter(n => {
    if (filter === "unread" && n.read) return false
    if (filter === "read" && !n.read) return false
    if (search && !(n.title?.toLowerCase().includes(search.toLowerCase()) || n.message?.toLowerCase().includes(search.toLowerCase()))) return false
    if (isAdmin && userFilter && n.user) {
      const fio = `${n.user.lastName || ''} ${n.user.firstName || ''} ${n.user.middleName || ''}`.toLowerCase()
      if (!(fio.includes(userFilter.toLowerCase()) || n.user.email?.toLowerCase().includes(userFilter.toLowerCase()))) return false
    }
    return true
  }), [notifications, filter, search, userFilter, isAdmin])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id })
    })
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = async () => {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: null }) // null = все
    })
    setNotifications(notifications => notifications.map(n => ({ ...n, read: true })))
  }

  const refresh = () => {
    setLoading(true)
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id])
  }
  const toggleSelectAll = () => {
    if (selected.length === paged.length) setSelected([])
    else setSelected(paged.map(n => n.id))
  }
  const clearSelection = () => setSelected([])

  const deleteSelected = async () => {
    const ok = await confirm({ title: "Удалить выбранные уведомления?" })
    if (!ok) return
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected })
    })
    setNotifications(notifications => notifications.filter(n => !selected.includes(n.id)))
    setSelected([])
  }

  const filteredUsers = usersList.filter(u => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return true
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    )
  })

  return (
    <div className="max-w-5xl mx-auto py-8">
      {dialog}
      {/* Фильтр по периоду */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={period === 'all' ? 'default' : 'outline'} onClick={() => setPeriod('all')}>Все</Button>
        <Button size="sm" variant={period === 'today' ? 'default' : 'outline'} onClick={() => setPeriod('today')}>Сегодня</Button>
        <Button size="sm" variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>Неделя</Button>
        <Button size="sm" variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')}>Месяц</Button>
      </div>
      {/* Табло статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего уведомлений</CardTitle>
            <Bell className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <CardDescription>За период: {period === 'all' ? 'все' : period === 'today' ? 'сегодня' : period === 'week' ? 'неделя' : 'месяц'}</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новых</CardTitle>
            <Circle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unread}</div>
            <CardDescription>Не прочитано за период</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прочитанных</CardTitle>
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{read}</div>
            <CardDescription>Прочитано за период</CardDescription>
          </CardContent>
        </Card>
      </div>
          <Card>
            <CardHeader>
          <CardTitle>Центр уведомлений {isAdmin && <span className="text-xs text-blue-600 ml-2">(Администратор)</span>}</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="flex gap-2 mb-6">
            {TABS.map(t => (
              <Button key={t.key} variant={tab === t.key ? "default" : "outline"} onClick={() => setTab(t.key)}>{t.label}</Button>
            ))}
          </div>
          <div>
            {tab === "notifications" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                  <Input placeholder="Поиск по уведомлениям..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
                  <div className="flex gap-2">
                    <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => { setFilter("all"); setPage(1) }}>Все</Button>
                    <Button size="sm" variant={filter === "unread" ? "default" : "outline"} onClick={() => { setFilter("unread"); setPage(1) }}>Непрочитанные</Button>
                    <Button size="sm" variant={filter === "read" ? "default" : "outline"} onClick={() => { setFilter("read"); setPage(1) }}>Прочитанные</Button>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>Обновить</Button>
                    <Button size="sm" variant="outline" onClick={markAllAsRead} disabled={notifications.every(n => n.read) || loading}>Отметить все как прочитанные</Button>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <Input placeholder="ФИО или email пользователя" value={userFilter} onChange={e => { setUserFilter(e.target.value); setPage(1) }} className="max-w-xs" />
                      <div className="flex gap-2">
                      <span className="text-xs text-muted-foreground">Всего: {notifications.length}</span>
                      <span className="text-xs text-green-600">Прочитано: {notifications.filter(n => n.read).length}</span>
                      <span className="text-xs text-blue-600">Новых: {notifications.filter(n => !n.read).length}</span>
                    </div>
                    <Button size="sm" onClick={() => setCreateOpen(true)}>Создать уведомление</Button>
                  </div>
                )}
                {isAdmin && selected.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    <Button size="sm" variant="destructive" onClick={deleteSelected}>Удалить выбранные ({selected.length})</Button>
                    <Button size="sm" variant="outline" onClick={clearSelection}>Сбросить выбор</Button>
              </div>
                )}
                <Separator className="mb-4" />
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" /></div>
                ) : paged.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">Нет уведомлений</div>
                ) : (
                  <div className="space-y-2">
                    {isAdmin && (
                      <div className="flex items-center gap-2 mb-1">
                        <input type="checkbox" ref={selectAllRef} checked={selected.length === paged.length && paged.length > 0} onChange={toggleSelectAll} />
                        <span className="text-xs text-muted-foreground">Выбрать все на странице</span>
                      </div>
                    )}
                    {paged.map(n => (
                      <div key={n.id} className={`flex items-start gap-3 p-3 border rounded bg-muted/50 ${isAdmin && selected.includes(n.id) ? 'ring-2 ring-blue-400' : ''}`}>
                        {isAdmin && (
                          <input type="checkbox" checked={selected.includes(n.id)} onChange={() => toggleSelect(n.id)} className="mt-1" />
                        )}
                        <button onClick={() => !n.read && markAsRead(n.id)} className="mt-1" title={n.read ? "Прочитано" : "Отметить как прочитанное"}>
                          {n.read ? <CheckCircle className="text-green-500 w-5 h-5" /> : <Circle className="text-blue-500 w-5 h-5" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{n.title}</span>
                            {!n.read && <Badge variant="outline">Новое</Badge>}
                      </div>
                          <div className="text-sm text-muted-foreground break-words">{n.message}</div>
                          {isAdmin && n.user && (
                            <div className="text-xs text-muted-foreground mt-1">{n.user.lastName} {n.user.firstName} {n.user.middleName} ({n.user.email})</div>
                          )}
                      </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-2 mt-1">{new Date(n.createdAt).toLocaleString("ru-RU")}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-muted-foreground">Показано {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} из {filtered.length}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Назад</Button>
                    <span className="text-xs">{page} / {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Вперёд</Button>
              </div>
                </div>
              </div>
            )}
            {tab === "settings" && (
              <div className="space-y-8">
                {settingsLoading ? (
                  <div className="text-center text-muted-foreground py-10">Загрузка настроек...</div>
                ) : settings && (
                  <>
                    <h2 className="text-lg font-bold mb-2">Каналы уведомлений</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Switch checked={!!(settings || defaultSettings).emailNotifications} onCheckedChange={v => saveSettings({ emailNotifications: v })} id="emailNotifications" disabled={settingsSaving || !settings} />
                        <Label htmlFor="emailNotifications">Email</Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch checked={!!(settings || defaultSettings).pushNotifications} onCheckedChange={v => saveSettings({ pushNotifications: v })} id="pushNotifications" disabled={settingsSaving || !settings} />
                        <Label htmlFor="pushNotifications">Push</Label>
                      </div>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <h2 className="text-lg font-bold mb-2">Общие параметры</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Switch checked={!!(settings || defaultSettings).emailNotifications} onCheckedChange={v => saveSettings({ emailNotifications: v })} id="default-email" disabled={settingsSaving} />
                      <Label htmlFor="default-email">Включить email-уведомления всем по умолчанию</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={!!(settings || defaultSettings).quietHours} onCheckedChange={v => saveSettings({ quietHours: v })} id="quiet-hours" disabled={settingsSaving} />
                      <Label htmlFor="quiet-hours">Включить режим тишины (не отправлять ночью)</Label>
                    </div>
                    <div>
                      <Label htmlFor="signature">Подпись по умолчанию</Label>
                      <Input id="signature" value={settings.signature || ''} onChange={e => saveSettings({ signature: e.target.value })} className="mt-1 max-w-md" disabled={settingsSaving} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === "templates" && (
              <div>Вкладка "Шаблоны" (email-уведомления) — будет реализовано далее</div>
            )}
            {tab === "escalation" && (
              <div>Вкладка "Эскалация" (правила эскалации) — будет реализовано далее</div>
            )}
                </div>
        </CardContent>
      </Card>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать уведомление</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch checked={bulkMode} onCheckedChange={setBulkMode} id="bulk-mode" />
              <Label htmlFor="bulk-mode">Массовая рассылка</Label>
              </div>
            {previewMode ? (
              <div className="space-y-4 p-4 border rounded bg-muted">
                <div className="text-sm text-muted-foreground">
                  Кому: {bulkMode
                    ? bulkUsers.map(id => usersList.find(u => u.id === id)?.name + ' (' + usersList.find(u => u.id === id)?.email + ')').join(", ")
                    : usersList.find(u => u.id === createUser)?.name + ' (' + usersList.find(u => u.id === createUser)?.email + ')'}
                </div>
                <div className="font-bold text-lg mb-2">{createTitle}</div>
                <div className="whitespace-pre-line">{createMessage}</div>
                <Button variant="outline" onClick={() => setPreviewMode(false)} className="mt-4">Вернуться к редактированию</Button>
              </div>
            ) : (
              <>
                {bulkMode ? (
            <div>
                    <Label>Пользователи</Label>
                    <Input placeholder="Поиск по ФИО или email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="mb-2" disabled={createLoading || usersLoading} />
                    <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
                      {usersLoading ? (
                        <div className="text-xs text-muted-foreground">Загрузка...</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-xs text-muted-foreground">Пользователи не найдены</div>
                      ) : filteredUsers.map(u => (
                        <label key={u.id} className="flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={bulkUsers.includes(u.id)} onChange={e => setBulkUsers(bulkUsers => e.target.checked ? [...bulkUsers, u.id] : bulkUsers.filter(id => id !== u.id))} disabled={createLoading} />
                          <span>{u.name} ({u.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                    <div>
                    <Label>Пользователь</Label>
                    <Input placeholder="Поиск по ФИО или email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="mb-2" disabled={createLoading || usersLoading} />
                    <select ref={userSelectRef} value={createUser} onChange={e => setCreateUser(e.target.value)} className="w-full border rounded p-2" disabled={createLoading || usersLoading}>
                      <option value="">Выберите пользователя</option>
                      {usersLoading ? (
                        <option disabled>Загрузка...</option>
                      ) : filteredUsers.length === 0 ? (
                        <option disabled>Пользователи не найдены</option>
                      ) : filteredUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
            <div>
                  <Label>Заголовок</Label>
                  <Input value={createTitle} onChange={e => setCreateTitle(e.target.value)} maxLength={100} disabled={createLoading} />
                        </div>
                        <div>
                  <Label>Текст</Label>
                  <textarea value={createMessage} onChange={e => setCreateMessage(e.target.value)} className="w-full border rounded p-2" rows={3} maxLength={500} disabled={createLoading} />
                        </div>
                {createError && <div className="text-red-600 text-sm">{createError}</div>}
              </>
            )}
          </div>
          <DialogFooter>
            {previewMode ? (
              <Button onClick={handleCreate} disabled={createLoading || (bulkMode ? bulkUsers.length === 0 : !createUser) || !createTitle || !createMessage}>{createLoading ? "Создание..." : bulkMode ? "Разослать" : "Создать"}</Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createLoading || (bulkMode ? bulkUsers.length === 0 : !createUser) || !createTitle || !createMessage}>{bulkMode ? "Разослать" : "Создать"}</Button>
                <Button variant="outline" onClick={() => setPreviewMode(true)} disabled={(bulkMode ? bulkUsers.length === 0 : !createUser) || !createTitle || !createMessage}>Предпросмотр</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
