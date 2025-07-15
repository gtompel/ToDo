import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// @ts-ignore
import ActiveDirectory from 'activedirectory2'
import jwt from 'jsonwebtoken'
import { createToken } from '@/lib/auth'

export async function POST(req: any) {
  const { login, password } = await req.json()
  const all = await prisma.systemSettings.findMany()
  const settings: any = {}
  for (const s of all) {
    try { settings[s.key] = JSON.parse(s.value) } catch { settings[s.key] = s.value }
  }
  // Формируем только нужные поля для LDAP
  const ldapConfig = {
    host: settings.ldapHost,
    port: settings.ldapPort,
    ssl: settings.ldapSSL,
    userDN: settings.ldapUserDN,
    userPassword: settings.ldapUserPassword,
    baseDN: settings.ldapBaseDN,
    attrLogin: settings.ldapAttrLogin,
    attrLoginCaseInsensitive: settings.ldapAttrLoginCaseInsensitive,
    attrEmail: settings.ldapAttrEmail,
    attrFirstName: settings.ldapAttrFirstName,
    attrLastName: settings.ldapAttrLastName,
    domain: settings.ldapDomain || '',
  }
  if (!ldapConfig.host || !ldapConfig.port || !ldapConfig.userDN || !ldapConfig.userPassword || !ldapConfig.baseDN || !ldapConfig.attrLogin) {
    return NextResponse.json({ success: false, error: 'LDAP настройки не заполнены' }, { status: 400 })
  }
  // Формируем url для activedirectory2
  const protocol = ldapConfig.ssl ? 'ldaps' : 'ldap';
  const url = `${protocol}://${ldapConfig.host}:${ldapConfig.port}`;
  // Формируем UPN для пользователя
  const domain = ldapConfig.domain || 'OIT.INT';
  let loginUPN = login;
  if (!login.includes('@')) {
    loginUPN = `${login}@${domain}`;
  }
  const diagnostics: any = { url, login, loginUPN, steps: [] };
  // Создаём экземпляр AD
  const ad = new ActiveDirectory({
    url,
    baseDN: ldapConfig.baseDN,
    username: ldapConfig.userDN,
    password: ldapConfig.userPassword,
    attributes: { user: ['dn', 'userPrincipalName', 'distinguishedName', 'cn', 'mail'] }
  });
  diagnostics.steps.push({ step: 'adInit', url, baseDN: ldapConfig.baseDN, admin: ldapConfig.userDN });
  // Проверяем логин/пароль через authenticate
  return new Promise((resolve) => {
    ad.authenticate(loginUPN, password, async (err: any, auth: boolean) => {
      if (err) {
        diagnostics.steps.push({ step: 'adAuthError', error: err.message, details: err });
        return resolve(NextResponse.json({ success: false, error: 'Ошибка авторизации: ' + err.message, diagnostics }));
      }
      if (!auth) {
        diagnostics.steps.push({ step: 'adAuthFail', loginUPN });
        return resolve(NextResponse.json({ success: false, error: 'Неверный логин или пароль', diagnostics }));
      }
      diagnostics.steps.push({ step: 'adAuthSuccess', loginUPN });
      // Получаем данные пользователя из AD
      ad.findUser(loginUPN, async (err: any, adUser: any) => {
        if (err || !adUser) {
          diagnostics.steps.push({ step: 'adFindUserError', error: err?.message, adUser });
        }
        diagnostics.steps.push({ step: 'adFindUser', adUser });
        diagnostics.adUserRaw = adUser;
        // Определяем роль
        const userRole = getUserRole(loginUPN)
        // Маппинг атрибутов AD к полям пользователя
        let firstName = '';
        let lastName = '';
        let middleName = '';
        if (adUser?.cn) {
          const fio = adUser.cn.split(' ');
          if (fio.length === 3) {
            lastName = fio[0];
            firstName = fio[1];
            middleName = fio[2];
          } else if (fio.length === 2) {
            lastName = fio[0];
            firstName = fio[1];
          } else if (fio.length === 1) {
            lastName = fio[0];
          }
        }
        const phone = '';
        const position = '';
        const department = '';
        // Найти или создать пользователя в БД
        let user = await prisma.user.findUnique({ where: { email: loginUPN } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: loginUPN,
              password: '',
              firstName,
              lastName,
              middleName,
              phone,
              position,
              department,
              role: userRole,
              status: 'active',
              isActive: true,
              lastLogin: new Date(),
            }
          });
          diagnostics.steps.push({ step: 'userCreated', userId: user.id });
        } else {
          // При каждом входе обновляем профиль из AD
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date(),
              role: userRole,
              firstName,
              lastName,
              middleName,
              phone,
              position,
              department,
            }
          });
          diagnostics.steps.push({ step: 'userFound', userId: user.id });
        }
        diagnostics.steps.push({ step: 'loginLog', userId: user.id, date: new Date().toISOString() });
        // --- Унификация сессии и токена ---
        const token = await createToken(user.id)
        diagnostics.steps.push({ step: 'sessionCreated', token })
        const response = NextResponse.json({ success: true, diagnostics })
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: false, // для локальной разработки
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return resolve(response)
      })
    });
  });
}

// Вынесенная функция для определения роли
function getUserRole(loginUPN: string) {
  const adminEmails = ['admin1@OIT.INT', 'admin2@OIT.INT', 'logiy@OIT.INT']
  const technicianEmails = ['tech1@OIT.INT']
  if (adminEmails.includes(loginUPN.toLowerCase())) return 'ADMIN'
  if (technicianEmails.includes(loginUPN.toLowerCase())) return 'TECHNICIAN'
  return 'USER'
} 