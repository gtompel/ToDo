"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react"
import Link from "next/link"

export default function NewApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: "",
    department: "",
    position: "",
    building: "",
    room: "",
    deviceType: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    monitorManufacturer: "",
    monitorModel: "",
    monitorSerial: "",
    operatingSystem: "",
    additionalSoftware: "",
    flashDrive: "",
    additionalInfo: "",
    needsEMVS: false,
    needsSKZI: false,
    needsRosatomAccess: false,
    acknowledgmentFile: null as File | null,
  })

  // Состояния для шаблонов
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [step, setStep] = useState<"select"|"form">("select")
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [formError, setFormError] = useState("")

  // Загрузка шаблонов при монтировании
  useEffect(() => {
    fetch("/api/templates?type=REQUEST")
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
  }, [])

  // Автозаполнение при выборе шаблона
  useEffect(() => {
    if (!selectedTemplateId) return
    const template = templates.find(t => t.id === selectedTemplateId)
    if (!template) return
    const fields = template.fields || {}
    setFormData(prev => ({
      ...prev,
      ...fields,
    }))
  }, [selectedTemplateId])

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    const data = new FormData()
    data.append("title", formData.fullName + " - " + formData.deviceType)
    data.append("description", JSON.stringify(formData))
    data.append("type", "hardware")
    data.append("priority", "MEDIUM")
    if (formData.acknowledgmentFile) {
      data.append("acknowledgmentFile", formData.acknowledgmentFile)
    }
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        body: data,
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Ошибка при создании запроса")
        return
      }
      alert("Запрос успешно подан!")
      setCurrentStep(1)
      setFormData({
        fullName: "",
        department: "",
        position: "",
        building: "",
        room: "",
        deviceType: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        monitorManufacturer: "",
        monitorModel: "",
        monitorSerial: "",
        operatingSystem: "",
        additionalSoftware: "",
        flashDrive: "",
        additionalInfo: "",
        needsEMVS: false,
        needsSKZI: false,
        needsRosatomAccess: false,
        acknowledgmentFile: null,
      })
    } catch (e) {
      alert("Ошибка при отправке запроса")
    }
  }

  // Получить выбранный шаблон
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  // Динамический рендеринг формы по шаблону
  const renderTemplateForm = () => {
    if (!selectedTemplate) return null
    return (
      <form
        onSubmit={e => {
          e.preventDefault()
          setFormError("")
          setFormErrors({})
          // Валидация
          const errors: {[key: string]: string} = {}
          for (const field of selectedTemplate.fields) {
            if (field.required && !formData[field.name]) {
              errors[field.name] = "Обязательное поле"
            }
          }
          if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            setFormError("Пожалуйста, заполните все обязательные поля")
            return
          }
          handleSubmit()
        }}
        className="space-y-6"
      >
        <Button type="button" variant="outline" onClick={() => setStep("select")}>Назад к выбору шаблона</Button>
        {formError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300">
            {formError}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Данные запроса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate.fields.map((field: any) => (
              <div className="space-y-2" key={field.name}>
                <Label htmlFor={field.name}>{field.name}{field.required && " *"}</Label>
                {field.type === "text" && (
                  <Input
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    id={field.name}
                    type="number"
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "date" && (
                  <Input
                    id={field.name}
                    type="date"
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "email" && (
                  <Input
                    id={field.name}
                    type="email"
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "password" && (
                  <Input
                    id={field.name}
                    type="password"
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "tel" && (
                  <Input
                    id={field.name}
                    type="tel"
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                )}
                {field.type === "select" && (
                  <Select value={formData[field.name] ?? ""} onValueChange={val => handleInputChange(field.name, val)}>
                    <SelectTrigger className={formErrors[field.name] ? "border-red-500" : ""}>
                      <SelectValue placeholder={field.description || "Выберите вариант"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={!!formData[field.name]}
                      onCheckedChange={val => handleInputChange(field.name, !!val)}
                    />
                    <Label htmlFor={field.name}>{field.description}</Label>
                  </div>
                )}
                {formErrors[field.name] && <div className="text-red-500 text-xs mt-1">{formErrors[field.name]}</div>}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" className="flex-1 md:flex-none">
            <Check className="w-4 h-4 mr-2" />
            Подать запрос
          </Button>
        </div>
      </form>
    )
  }

  if (step === "select") {
    return (
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-6">Выберите шаблон запроса</h1>
        <div className="space-y-3 mb-8">
          <button
            className={`w-full border rounded p-3 text-left hover:bg-gray-50 ${selectedTemplateId === "" ? "border-blue-500" : ""}`}
            onClick={() => { setSelectedTemplateId(""); setStep("form") }}
          >
            Без шаблона (стандартная форма)
          </button>
          {templates.map(t => (
            <button
              key={t.id}
              className={`w-full border rounded p-3 text-left hover:bg-gray-50 ${selectedTemplateId === t.id ? "border-blue-500" : ""}`}
              onClick={() => { setSelectedTemplateId(t.id); setStep("form") }}
            >
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Если выбран шаблон — показываем только форму по шаблону
  if (selectedTemplate) {
    return renderTemplateForm()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Информация о пользователе</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">ФИО *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <Label htmlFor="department">Подразделение *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Отдел информационных технологий"
                />
              </div>
              <div>
                <Label htmlFor="position">Должность *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="Ведущий инженер"
                />
              </div>
              <div>
                <Label htmlFor="building">Здание *</Label>
                <Input
                  id="building"
                  value={formData.building}
                  onChange={(e) => handleInputChange("building", e.target.value)}
                  placeholder="108"
                />
              </div>
              <div>
                <Label htmlFor="room">Помещение *</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  placeholder="129Б"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Информация об оборудовании</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deviceType">Тип устройства *</Label>
                <Select onValueChange={(value) => handleInputChange("deviceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип устройства" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pc">ПЭВМ</SelectItem>
                    <SelectItem value="nettop">Неттоп</SelectItem>
                    <SelectItem value="laptop">Ноутбук</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manufacturer">Производитель *</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                  placeholder="Dell, HP, Lenovo и т.д."
                />
              </div>
              <div>
                <Label htmlFor="model">Модель *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="OptiPlex 7090"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Серийный номер</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="ABC123456789"
                />
              </div>
            </div>

            <h4 className="text-lg font-medium mt-8">Монитор</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monitorManufacturer">Производитель</Label>
                <Input
                  id="monitorManufacturer"
                  value={formData.monitorManufacturer}
                  onChange={(e) => handleInputChange("monitorManufacturer", e.target.value)}
                  placeholder="Samsung, LG, Dell"
                />
              </div>
              <div>
                <Label htmlFor="monitorModel">Модель</Label>
                <Input
                  id="monitorModel"
                  value={formData.monitorModel}
                  onChange={(e) => handleInputChange("monitorModel", e.target.value)}
                  placeholder="S24F350"
                />
              </div>
              <div>
                <Label htmlFor="monitorSerial">Серийный номер</Label>
                <Input
                  id="monitorSerial"
                  value={formData.monitorSerial}
                  onChange={(e) => handleInputChange("monitorSerial", e.target.value)}
                  placeholder="MON123456"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">ПО и дополнительное оборудование</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="operatingSystem">Операционная система</Label>
                <Input
                  id="operatingSystem"
                  value={formData.operatingSystem}
                  onChange={(e) => handleInputChange("operatingSystem", e.target.value)}
                  placeholder="Уточнить у ОИТ/ОИБ"
                />
              </div>
              <div>
                <Label htmlFor="additionalSoftware">Дополнительное ПО</Label>
                <Input
                  id="additionalSoftware"
                  value={formData.additionalSoftware}
                  onChange={(e) => handleInputChange("additionalSoftware", e.target.value)}
                  placeholder="По умолчанию типовое"
                />
              </div>
              <div>
                <Label htmlFor="flashDrive">Флеш-носитель (уч.№)</Label>
                <Input
                  id="flashDrive"
                  value={formData.flashDrive}
                  onChange={(e) => handleInputChange("flashDrive", e.target.value)}
                  placeholder="Если необходим"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Дополнительная информация</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                placeholder="Если необходима"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium">Дополнительные требования</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsEMVS"
                  checked={formData.needsEMVS}
                  onCheckedChange={(checked) => handleInputChange("needsEMVS", checked as boolean)}
                />
                <Label htmlFor="needsEMVS">Требуется подключение через ЕМВС</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsSKZI"
                  checked={formData.needsSKZI}
                  onCheckedChange={(checked) => handleInputChange("needsSKZI", checked as boolean)}
                />
                <Label htmlFor="needsSKZI">Требуется использование СКЗИ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsRosatomAccess"
                  checked={formData.needsRosatomAccess}
                  onCheckedChange={(checked) => handleInputChange("needsRosatomAccess", checked as boolean)}
                />
                <Label htmlFor="needsRosatomAccess">Требуется доступ к ресурсам ГК «Росатом»</Label>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Загрузка документов</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="acknowledgmentFile">Лист ознакомления с инструкцией пользователя *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Загрузите отсканированный и подписанный лист ознакомления</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      handleInputChange("acknowledgmentFile", file)
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline">
                      Выбрать файл
                    </Button>
                  </Label>
                  {formData.acknowledgmentFile && (
                    <p className="mt-2 text-sm text-green-600">Файл загружен: {formData.acknowledgmentFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Проверьте данные перед отправкой:</h4>
              <ul className="text-sm space-y-1">
                <li>• ФИО: {formData.fullName}</li>
                <li>• Подразделение: {formData.department}</li>
                <li>• Должность: {formData.position}</li>
                <li>
                  • Местоположение: Здание {formData.building}, помещение {formData.room}
                </li>
                <li>
                  • Оборудование: {formData.deviceType} {formData.manufacturer} {formData.model}
                </li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button type="button" variant="outline" onClick={() => setStep("select")}>Назад к выбору шаблона</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Новый запрос на создание АП АСЗИ «НИТИ»</CardTitle>
            <CardDescription>Заполните все необходимые поля для подачи запроса</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Выбор шаблона */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="template">Шаблон</Label>
              <select
                id="template"
                className="w-full border rounded px-3 py-2"
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Без шаблона</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step < currentStep ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {step < 4 && <div className={`w-16 h-1 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Пользователь</span>
                <span>Оборудование</span>
                <span>ПО и требования</span>
                <span>Документы</span>
              </div>
            </div>
            {renderStep()}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Далее
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Подать запрос
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 