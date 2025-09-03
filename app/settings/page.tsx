"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Mail, Shield, Database, Clock, Save, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Страница общих настроек системы
const defaultSettings = {
  // Общие настройки
  systemName: "ITSM System",
  systemDescription: "Система управления IT-сервисами",
  timezone: "Europe/Moscow",
  language: "ru",
  // Уведомления
  emailNotifications: true,
  pushNotifications: true,
  notificationFrequency: "immediate",
  // Безопасность
  sessionTimeout: "30",
  passwordMinLength: "8",
  requireTwoFactor: false,
  allowPasswordReset: true,
  // База данных
  backupFrequency: "daily",
  retentionPeriod: "90",
  autoCleanup: true,
  // Интеграции (LDAP)
  ldapName: "",
  ldapDescription: "",
  ldapHost: "",
  ldapPort: "389",
  ldapSSL: false,
  ldapFallback: false,
  ldapUserDN: "",
  ldapUserPassword: "",
  ldapBaseDN: "",
  ldapAttrEmail: "mail",
  ldapAttrLogin: "sAMAccountName",
  ldapAttrLoginCaseInsensitive: true,
  ldapAttrFirstName: "",
  ldapAttrLastName: "sn",
  // SLA настройки
  incidentResponseTime: "4",
  requestResponseTime: "24",
  escalationTime: "2",
}

export default function SettingsPage() {
  // Состояния для всех настроек системы
  const [settings, setSettings] = useState({
    ...defaultSettings,
    // Общие настройки
    systemName: "ITSM System",
    systemDescription: "Система управления IT-сервисами",
    timezone: "Europe/Moscow",
    language: "ru",
    // Уведомления
    emailNotifications: true,
    pushNotifications: true,
    notificationFrequency: "immediate",
    // Безопасность
    sessionTimeout: "30",
    passwordMinLength: "8",
    requireTwoFactor: false,
    allowPasswordReset: true,
    // База данных
    backupFrequency: "daily",
    retentionPeriod: "90",
    autoCleanup: true,
    // Интеграции (LDAP)
    ldapName: "",
    ldapDescription: "",
    ldapHost: "",
    ldapPort: "389",
    ldapSSL: false,
    ldapFallback: false,
    ldapUserDN: "",
    ldapUserPassword: "",
    ldapBaseDN: "",
    ldapAttrEmail: "mail",
    ldapAttrLogin: "sAMAccountName",
    ldapAttrLoginCaseInsensitive: true,
    ldapAttrFirstName: "",
    ldapAttrLastName: "sn",
    incidentResponseTime: "4",
    requestResponseTime: "24",
    escalationTime: "2",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dbStatus, setDbStatus] = useState<{ status: string; size: number; lastBackup: string | null } | null>(null)
  const [dbStatusLoading, setDbStatusLoading] = useState(false)
  const [ldapTestLoading, setLdapTestLoading] = useState(false)
  const [ldapStatus, setLdapStatus] = useState<{ success: boolean; message: string } | null>(null)
  const ldapPasswordRef = useRef<HTMLInputElement>(null)

  const fetchDbStatus = useCallback(() => {
    setDbStatusLoading(true)
    fetch("/api/db-status")
      .then(res => res.json())
      .then(setDbStatus)
      .catch(() => {
        setDbStatus({ status: "error", size: 0, lastBackup: null })
        toast({ title: "Ошибка", description: "Ошибка получения статуса базы данных", variant: "destructive" })
      })
      .finally(() => setDbStatusLoading(false))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings((prev) => ({ ...prev, ...defaultSettings, ...data.settings })))
      .catch(() => toast({ title: "Ошибка", description: "Ошибка загрузки настроек", variant: "destructive" }))
      .finally(() => setLoading(false))
    fetchDbStatus()
  }, [fetchDbStatus])

  // Обработчик изменения значения настройки
  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleLdapTest = async () => {
    setLdapTestLoading(true)
    try {
      const res = await fetch("/api/ldap-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settings.ldapHost,
          port: settings.ldapPort,
          user: settings.ldapUserDN,
          password: settings.ldapUserPassword,
          baseDN: settings.ldapBaseDN,
          ssl: settings.ldapSSL,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: "LDAP", description: "Подключение успешно" })
        setLdapStatus({ success: true, message: "Подключение успешно" })
      } else {
        toast({ title: "LDAP", description: "Ошибка подключения: " + (data.error || "Unknown error"), variant: "destructive" })
        setLdapStatus({ success: false, message: data.error || "Unknown error" })
      }
    } catch (e: any) {
      toast({ title: "LDAP", description: "Ошибка подключения: " + (e?.message || String(e)), variant: "destructive" })
      setLdapStatus({ success: false, message: e?.message || String(e) })
    } finally {
      setLdapTestLoading(false)
    }
  }

  const handleLdapDisconnect = async () => {
    // Сбросить все поля LDAP и сохранить
    setSettings((prev) => ({
      ...prev,
      ldapName: "",
      ldapDescription: "",
      ldapHost: "",
      ldapPort: "389",
      ldapSSL: false,
      ldapFallback: false,
      ldapUserDN: "",
      ldapUserPassword: "",
      ldapBaseDN: "",
      ldapAttrEmail: "mail",
      ldapAttrLogin: "sAMAccountName",
      ldapAttrLoginCaseInsensitive: true,
      ldapAttrFirstName: "",
      ldapAttrLastName: "sn",
    }))
    await handleSave()
    setLdapStatus(null)
    toast({ title: "LDAP", description: "Интеграция отключена" })
  }

  // Сохранить настройки
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Успешно", description: "Настройки сохранены" })
    } catch {
      toast({ title: "Ошибка", description: "Ошибка сохранения настроек", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  // Сбросить настройки к значениям по умолчанию
  const handleReset = async () => {
    setLoading(true)
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data.settings))
      .catch(() => toast({ title: "Ошибка", description: "Ошибка сброса настроек", variant: "destructive" }))
      .finally(() => setLoading(false))
  }

  // Функция форматирования размера БД
  function formatDbSize(size: number) {
    if (!size) return "-"
    if (size > 1024 * 1024 * 1024) return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
    if (size > 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + " MB"
    if (size > 1024) return (size / 1024).toFixed(2) + " KB"
    return size + " B"
  }

  // Функция форматирования времени бэкапа
  function formatBackupTime(iso: string | null) {
    if (!iso) return "-"
    const date = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return `${diff} сек. назад`
    if (diff < 3600) return `${Math.floor(diff/60)} мин. назад`
    if (diff < 86400) return `${Math.floor(diff/3600)} ч. назад`
    return date.toLocaleString("ru-RU")
  }

  const validateLdap = () => {
    if (!settings.ldapName?.trim()) return "Укажите название подключения"
    if (!settings.ldapHost?.trim()) return "Укажите адрес LDAP сервера"
    if (!settings.ldapPort?.trim()) return "Укажите порт LDAP сервера"
    if (!settings.ldapUserDN?.trim()) return "Укажите DN пользователя"
    if (!settings.ldapUserPassword?.trim()) return "Укажите пароль пользователя"
    if (!settings.ldapBaseDN?.trim()) return "Укажите BaseDN"
    if (!settings.ldapAttrEmail?.trim()) return "Укажите атрибут email"
    if (!settings.ldapAttrLogin?.trim()) return "Укажите атрибут логина"
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки системы</h1>
          <p className="text-muted-foreground">Конфигурация и управление параметрами ITSM системы</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading || saving}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Сбросить
          </Button>
          <Button onClick={handleLdapTest} disabled={ldapTestLoading} variant="outline">
            {ldapTestLoading ? "Проверка..." : "Проверить подключение"}
          </Button>
          <Button onClick={async () => {
            const err = validateLdap()
            if (err) {
              toast({ title: "Ошибка", description: err, variant: "destructive" })
              return
            }
            await handleSave()
          }} disabled={loading || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12">Загрузка настроек...</div>
      ) : (
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Общие
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Безопасность
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              База данных
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Интеграции
            </TabsTrigger>
            <TabsTrigger value="sla" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              SLA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основные настройки</CardTitle>
                <CardDescription>Базовая конфигурация системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemName">Название системы</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => handleSettingChange("systemName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Часовой пояс</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                        <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                        <SelectItem value="Asia/Almaty">Алматы (UTC+6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemDescription">Описание системы</Label>
                  <Textarea
                    id="systemDescription"
                    value={settings.systemDescription}
                    onChange={(e) => handleSettingChange("systemDescription", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Язык интерфейса</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="uk">Українська</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>Конфигурация системы уведомлений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email уведомления</Label>
                      <p className="text-sm text-muted-foreground">Отправка уведомлений по электронной почте</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push уведомления</Label>
                      <p className="text-sm text-muted-foreground">Уведомления в браузере</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Частота уведомлений</Label>
                  <Select
                    value={settings.notificationFrequency}
                    onValueChange={(value) => handleSettingChange("notificationFrequency", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Немедленно</SelectItem>
                      <SelectItem value="hourly">Каждый час</SelectItem>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки безопасности</CardTitle>
                <CardDescription>Конфигурация параметров безопасности системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Минимальная длина пароля</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Двухфакторная аутентификация</Label>
                      <p className="text-sm text-muted-foreground">Обязательная 2FA для всех пользователей</p>
                    </div>
                    <Switch
                      checked={settings.requireTwoFactor}
                      onCheckedChange={(checked) => handleSettingChange("requireTwoFactor", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Самостоятельный сброс пароля</Label>
                      <p className="text-sm text-muted-foreground">Разрешить пользователям сбрасывать пароли</p>
                    </div>
                    <Switch
                      checked={settings.allowPasswordReset}
                      onCheckedChange={(checked) => handleSettingChange("allowPasswordReset", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки базы данных</CardTitle>
                <CardDescription>Конфигурация резервного копирования и обслуживания БД</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Частота резервного копирования</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(value) => handleSettingChange("backupFrequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Каждый час</SelectItem>
                        <SelectItem value="daily">Ежедневно</SelectItem>
                        <SelectItem value="weekly">Еженедельно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionPeriod">Период хранения (дни)</Label>
                    <Input
                      id="retentionPeriod"
                      type="number"
                      value={settings.retentionPeriod}
                      onChange={(e) => handleSettingChange("retentionPeriod", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Автоматическая очистка</Label>
                    <p className="text-sm text-muted-foreground">Автоматическое удаление старых записей</p>
                  </div>
                  <Switch
                    checked={settings.autoCleanup}
                    onCheckedChange={(checked) => handleSettingChange("autoCleanup", checked)}
                  />
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Статус базы данных</span>
                    <Button size="icon" variant="ghost" onClick={fetchDbStatus} disabled={dbStatusLoading} aria-label="Обновить статус">
                      <RefreshCw className={dbStatusLoading ? "animate-spin" : ""} />
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Размер БД:</span>
                      <Badge variant="secondary">{dbStatusLoading ? "..." : formatDbSize(dbStatus?.size ?? 0)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Последний бэкап:</span>
                      <Badge variant="secondary">{dbStatusLoading ? "..." : formatBackupTime(dbStatus?.lastBackup ?? null)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Статус:</span>
                      {dbStatusLoading ? (
                        <Badge className="bg-muted text-foreground">Проверка...</Badge>
                      ) : dbStatus?.status === "healthy" ? (
                        <Badge className="bg-green-100 text-green-800">Здоровая</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Ошибка</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>LDAP подключение</CardTitle>
                <CardDescription>Настройка подключения к корпоративному LDAP/AD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="ldapName">Название *</Label>
                  <Input id="ldapName" value={settings.ldapName || ""} onChange={e => handleSettingChange("ldapName", e.target.value)} placeholder="info.nit.ru" />
                  <Label htmlFor="ldapDescription">Описание LDAP соединения</Label>
                  <Input id="ldapDescription" value={settings.ldapDescription || ""} onChange={e => handleSettingChange("ldapDescription", e.target.value)} placeholder="Описание LDAP соединения" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ldapHost">Адрес LDAP сервера *</Label>
                      <Input id="ldapHost" value={settings.ldapHost || ""} onChange={e => handleSettingChange("ldapHost", e.target.value)} placeholder="info.nit.ru" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ldapPort">Порт LDAP сервера *</Label>
                      <Input id="ldapPort" value={settings.ldapPort || ""} onChange={e => handleSettingChange("ldapPort", e.target.value)} placeholder="389" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="ldapSSL" checked={!!settings.ldapSSL} onChange={e => handleSettingChange("ldapSSL", e.target.checked)} />
                    <Label htmlFor="ldapSSL">Использовать SSL соединение (ldaps)</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="ldapFallback" checked={!!settings.ldapFallback} onChange={e => handleSettingChange("ldapFallback", e.target.checked)} />
                    <Label htmlFor="ldapFallback">Аутентифицировать пользователя если LDAP сервер недоступен</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ldapUserDN">DN пользователя *</Label>
                      <Input id="ldapUserDN" value={settings.ldapUserDN || ""} onChange={e => handleSettingChange("ldapUserDN", e.target.value)} placeholder="CN=Администратор,OU=..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ldapUserPassword">Пароль пользователя *</Label>
                      <Input id="ldapUserPassword" type="password" value={settings.ldapUserPassword || ""} onChange={e => handleSettingChange("ldapUserPassword", e.target.value)} placeholder="Пароль пользователя" />
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-lg mt-6">Пользователи LDAP подключения</h4>
                <div className="space-y-4">
                  <Label htmlFor="ldapBaseDN">BaseDn *</Label>
                  <Input id="ldapBaseDN" value={settings.ldapBaseDN || ""} onChange={e => handleSettingChange("ldapBaseDN", e.target.value)} placeholder="DC=info,DC=nit,DC=ru" />
                  <Label htmlFor="ldapAttrEmail">LDAP атрибут для email пользователя *</Label>
                  <Input id="ldapAttrEmail" value={settings.ldapAttrEmail || ""} onChange={e => handleSettingChange("ldapAttrEmail", e.target.value)} placeholder="mail" />
                  <Label htmlFor="ldapAttrLogin">LDAP атрибут для логина пользователя *</Label>
                  <Input id="ldapAttrLogin" value={settings.ldapAttrLogin || ""} onChange={e => handleSettingChange("ldapAttrLogin", e.target.value)} placeholder="sAMAccountName" />
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="ldapAttrLoginCaseInsensitive" checked={!!settings.ldapAttrLoginCaseInsensitive} onChange={e => handleSettingChange("ldapAttrLoginCaseInsensitive", e.target.checked)} />
                    <Label htmlFor="ldapAttrLoginCaseInsensitive">Игнорировать регистр при проверке логина</Label>
                  </div>
                  <Label htmlFor="ldapAttrFirstName">LDAP атрибут для имени пользователя</Label>
                  <Input id="ldapAttrFirstName" value={settings.ldapAttrFirstName || ""} onChange={e => handleSettingChange("ldapAttrFirstName", e.target.value)} placeholder="givenName" />
                  <Label htmlFor="ldapAttrLastName">LDAP атрибут для фамилии пользователя</Label>
                  <Input id="ldapAttrLastName" value={settings.ldapAttrLastName || ""} onChange={e => handleSettingChange("ldapAttrLastName", e.target.value)} placeholder="sn" />
                </div>
                {/* Статус подключения */}
                {ldapStatus && (
                  <div className={`p-3 rounded text-sm ${ldapStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{ldapStatus.message}</div>
                )}
                {/* Кнопка отключения интеграции */}
                {(settings.ldapHost || settings.ldapUserDN || settings.ldapBaseDN) && (
                  <Button variant="destructive" onClick={handleLdapDisconnect} className="mt-2">Отключить интеграцию</Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки SLA</CardTitle>
                <CardDescription>Конфигурация соглашений об уровне обслуживания</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incidentResponseTime">Время реакции на инциденты (часы)</Label>
                    <Input
                      id="incidentResponseTime"
                      type="number"
                      value={settings.incidentResponseTime}
                      onChange={(e) => handleSettingChange("incidentResponseTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestResponseTime">Время реакции на запросы (часы)</Label>
                    <Input
                      id="requestResponseTime"
                      type="number"
                      value={settings.requestResponseTime}
                      onChange={(e) => handleSettingChange("requestResponseTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escalationTime">Время эскалации (часы)</Label>
                    <Input
                      id="escalationTime"
                      type="number"
                      value={settings.escalationTime}
                      onChange={(e) => handleSettingChange("escalationTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Матрица приоритетов</h4>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="font-medium">Приоритет</div>
                    <div className="font-medium">Время реакции</div>
                    <div className="font-medium">Время решения</div>
                    <div className="font-medium">Эскалация</div>

                    <div>Критический</div>
                    <div>15 мин</div>
                    <div>4 часа</div>
                    <div>1 час</div>

                    <div>Высокий</div>
                    <div>1 час</div>
                    <div>8 часов</div>
                    <div>2 часа</div>

                    <div>Средний</div>
                    <div>4 часа</div>
                    <div>24 часа</div>
                    <div>8 часов</div>

                    <div>Низкий</div>
                    <div>8 часов</div>
                    <div>72 часа</div>
                    <div>24 часа</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
