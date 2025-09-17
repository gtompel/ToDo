import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { isRateLimited } from '@/lib/utils'

export const runtime = 'nodejs';

interface LoginBody {
  login: string
  password: string
}

interface LDAPConfig {
  host: string
  port: number | string
  ssl: boolean
  userDN: string
  userPassword: string
  baseDN: string
  attrLogin: string
  attrLoginCaseInsensitive?: boolean
  attrEmail?: string
  attrFirstName?: string
  attrLastName?: string
  domain?: string
}

interface ADUser {
  dn?: string
  userPrincipalName?: string
  distinguishedName?: string
  cn?: string
  mail?: string
  [key: string]: unknown
}

interface Diagnostics {
  url: string
  login: string
  loginUPN: string
  steps: Array<Record<string, unknown>>
  adUserRaw?: ADUser | null
  [key: string]: unknown
}

type UserRole = 'ADMIN' | 'TECHNICIAN' | 'USER'

interface ADInstance {
  authenticate(username: string, password: string, cb: (err: unknown, auth?: boolean) => void): void
  findUser(username: string, cb: (err: unknown, user?: ADUser | null) => void): void
}

type ADConstructor = new (opts: {
  url: string
  baseDN: string
  username: string
  password: string
  attributes?: { user: string[] }
}) => ADInstance

function getErrorMessage(err: unknown): string {
  if (!err) return ''
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try { return JSON.stringify(err) } catch { return String(err) }
}

function getUserRole(loginUPN: string): UserRole {
  const adminEmails = ['admin1@oit.int', 'admin2@oit.int', 'logiy@oit.int']
  const technicianEmails = ['tech1@oit.int']
  const norm = loginUPN.toLowerCase()
  if (adminEmails.includes(norm)) return 'ADMIN'
  if (technicianEmails.includes(norm)) return 'TECHNICIAN'
  return 'USER'
}

/* ===== helpers для безопасного парсинга настроек ===== */
function parseString(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return fallback
}

function parseBoolean(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'true' || s === '1' || s === 'yes') return true
    if (s === 'false' || s === '0' || s === 'no') return false
  }
  if (typeof v === 'number') return v !== 0
  return fallback
}

/**
 * Порт может быть number или строкой (например "389" или "vendor-specific")
 * Возвращает number, если строка содержит валидное число, иначе саму строку.
 */
function parsePort(v: unknown, fallback = 389): number | string {
  if (v == null) return fallback
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const trimmed = v.trim()
    if (trimmed === '') return fallback
    const n = Number(trimmed)
    return Number.isNaN(n) ? trimmed : n
  }
  return fallback
}

/* ===== маршрут POST ===== */
export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json()) as Partial<LoginBody>
  const login = body.login ?? ''
  const password = body.password ?? ''

  // CSRF: Origin/Host проверка
  try {
    const origin = req.headers.get('origin') ?? ''
    const host = req.headers.get('host') ?? ''
    const allowedEnv = (process.env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const derived = [`http://${host}`, `https://${host}`]
    const isAllowed = origin === '' || allowedEnv.includes(origin) || derived.includes(origin)
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Недопустимый источник запроса' }, { status: 403 })
    }
  } catch {
    // silent
  }

  // Rate limit: 5 попыток за 10 минут на ключ login+ip
  const forwarded = req.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded || 'unknown'
  const key = `ldap:${login}:${ip}`
  if (isRateLimited(key, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: 'Слишком много попыток. Попробуйте позже.' }, { status: 429 })
  }

  // Загружаем настройки из БД
  const all = await prisma.systemSettings.findMany()
  const settingsRecord: Record<string, unknown> = {}
  for (const s of all) {
    try { settingsRecord[s.key] = JSON.parse(s.value) } catch { settingsRecord[s.key] = s.value }
  }

  // безопасный маппинг настроек
  const ldapHost = parseString(settingsRecord.ldapHost, '')
  const ldapPort = parsePort(settingsRecord.ldapPort, 389)
  const ldapSSL = parseBoolean(settingsRecord.ldapSSL, false)
  const ldapUserDN = parseString(settingsRecord.ldapUserDN, '')
  const ldapUserPassword = parseString(settingsRecord.ldapUserPassword, '')
  const ldapBaseDN = parseString(settingsRecord.ldapBaseDN, '')
  const ldapAttrLogin = parseString(settingsRecord.ldapAttrLogin, '')
  const ldapAttrLoginCaseInsensitive = parseBoolean(settingsRecord.ldapAttrLoginCaseInsensitive, false)
  const ldapAttrEmail = parseString(settingsRecord.ldapAttrEmail, '')
  const ldapAttrFirstName = parseString(settingsRecord.ldapAttrFirstName, '')
  const ldapAttrLastName = parseString(settingsRecord.ldapAttrLastName, '')
  const ldapDomain = parseString(settingsRecord.ldapDomain, '')

  const ldapConfig: LDAPConfig = {
    host: ldapHost,
    port: ldapPort,
    ssl: ldapSSL,
    userDN: ldapUserDN,
    userPassword: ldapUserPassword,
    baseDN: ldapBaseDN,
    attrLogin: ldapAttrLogin,
    attrLoginCaseInsensitive: ldapAttrLoginCaseInsensitive,
    attrEmail: ldapAttrEmail,
    attrFirstName: ldapAttrFirstName,
    attrLastName: ldapAttrLastName,
    domain: ldapDomain
  }

  if (!ldapConfig.host || !ldapConfig.port || !ldapConfig.userDN || !ldapConfig.userPassword || !ldapConfig.baseDN || !ldapConfig.attrLogin) {
    return NextResponse.json({ success: false, error: 'LDAP настройки не заполнены' }, { status: 400 })
  }

  const protocol = ldapConfig.ssl ? 'ldaps' : 'ldap'
  const url = `${protocol}://${ldapConfig.host}:${ldapConfig.port}`
  const domain = ldapConfig.domain || 'OIT.INT'
  let loginUPN = login
  if (!login.includes('@')) loginUPN = `${login}@${domain}`

  const diagnostics: Diagnostics = { url, login, loginUPN, steps: [] }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AD = require('activedirectory2') as unknown as ADConstructor

  diagnostics.steps.push({ step: 'adInit', url, baseDN: ldapConfig.baseDN, admin: ldapConfig.userDN })

  const ad = new AD({
    url,
    baseDN: ldapConfig.baseDN,
    username: ldapConfig.userDN,
    password: ldapConfig.userPassword,
    attributes: { user: ['dn', 'userPrincipalName', 'distinguishedName', 'cn', 'mail'] }
  })

  return new Promise<Response>((resolve) => {
    ad.authenticate(loginUPN, password, async (err: unknown, auth?: boolean) => {
      if (err) {
        const safeMsg = getErrorMessage(err).replace(/\u0000/g, '')
        await prisma.activityLog.create({
          data: {
            userId: 'unknown',
            action: `LDAP ошибка: ${safeMsg}`.slice(0, 1000),
            status: 'error',
            ip
          }
        })
        diagnostics.steps.push({ step: 'adAuthError', error: safeMsg })
        return resolve(NextResponse.json({ success: false, error: 'Ошибка авторизации: ' + safeMsg, diagnostics }))
      }

      if (!auth) {
        await prisma.activityLog.create({
          data: { userId: 'unknown', action: 'LDAP: неверный логин или пароль', status: 'error', ip }
        })
        diagnostics.steps.push({ step: 'adAuthFail', loginUPN })
        return resolve(NextResponse.json({ success: false, error: 'Неверный логин или пароль', diagnostics }))
      }

      diagnostics.steps.push({ step: 'adAuthSuccess', loginUPN })

      ad.findUser(loginUPN, async (errFind: unknown, adUser?: ADUser | null) => {
        if (errFind || !adUser) {
          diagnostics.steps.push({ step: 'adFindUserError', error: getErrorMessage(errFind), adUser: adUser ?? null })
        } else {
          diagnostics.steps.push({ step: 'adFindUser', adUser })
        }
        diagnostics.adUserRaw = adUser ?? null

        let firstName = ''
        let lastName = ''
        let middleName = ''
        if (adUser?.cn && typeof adUser.cn === 'string') {
          const fio = adUser.cn.split(' ').filter(Boolean)
          if (fio.length === 3) {
            lastName = fio[0]; firstName = fio[1]; middleName = fio[2]
          } else if (fio.length === 2) {
            lastName = fio[0]; firstName = fio[1]
          } else if (fio.length === 1) {
            lastName = fio[0]
          }
        }

        const phone = ''
        const position = ''
        const department = ''

        let user = await prisma.user.findUnique({ where: { username: login } })
        if (!user) {
          user = await prisma.user.findUnique({ where: { email: loginUPN } })
          if (user && !user.username) {
            user = await prisma.user.update({ where: { id: user.id }, data: { username: login } })
            diagnostics.steps.push({ step: 'userUpdatedUsername', userId: user.id })
          }
        }

        if (!user) {
          const created = await prisma.user.create({
            data: {
              username: login,
              email: loginUPN,
              password: '',
              firstName,
              lastName,
              middleName,
              phone,
              position,
              department,
              role: getUserRole(loginUPN),
              status: 'active',
              isActive: true,
              lastLogin: new Date()
            }
          })
          user = created
          diagnostics.steps.push({ step: 'userCreated', userId: user.id })
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date(),
              role: getUserRole(loginUPN),
              firstName,
              lastName,
              middleName,
              phone,
              position,
              department
            }
          })
          diagnostics.steps.push({ step: 'userFound', userId: user.id })
        }

        await prisma.activityLog.create({
          data: { userId: user.id, action: 'Успешный вход через LDAP', status: 'success', ip }
        })
        diagnostics.steps.push({ step: 'loginLog', userId: user.id, date: new Date().toISOString() })

        const token = await createToken(user.id)
        diagnostics.steps.push({ step: 'sessionCreated' })

        const response = NextResponse.json({ success: true, diagnostics })
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        })

        return resolve(response)
      })
    })
  })
}
