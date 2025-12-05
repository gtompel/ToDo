import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import ActiveDirectory from 'activedirectory2'

// Указываем, что этот обработчик будет выполняться в Node.js-рантайме,
// а не в edge-окружении Next.js.
export const runtime = 'nodejs';

export async function POST(req: any): Promise<Response> {
  // Получаем тело запроса в виде JSON; ожидаем поля:
  // host, port, user, password, ssl, baseDN
  const { host, port, user, password, ssl, baseDN } = await req.json();

  // Формируем URL подключения: ldap://host:port или ldaps://host:port при ssl=true
  const url = `${ssl ? 'ldaps' : 'ldap'}://${host}:${port}`;

  // Создаём экземпляр ActiveDirectory с параметрами подключения.
  // baseDN может быть пустой строкой, если не передан.
  const ad = new ActiveDirectory({
    url,
    baseDN: baseDN || '',
    username: user,
    password,
  });

  // ad.authenticate использует callback API, поэтому мы оборачиваем
  // вызов в Promise, чтобы корректно вернуть асинхронный ответ из Next.js handler.
  return new Promise<Response>((resolve) => {
    ad.authenticate(user, password, (err: any, auth: boolean) => {
      // Если возникла ошибка при попытке аутентификации (например, недоступен сервер),
      // возвращаем JSON с описанием ошибки.
      if (err) {
        // В production лучше не возвращать сырые сообщения ошибок от LDAP
        // — можно логировать их на сервере, а клиенту отдавать обобщённое сообщение.
        return resolve(NextResponse.json({ success: false, error: err.message }));
      }

      // Если аутентификация не удалась (логин/пароль неверны) — возвращаем понятный ответ.
      if (!auth) {
        return resolve(NextResponse.json({ success: false, error: 'Неверный логин или пароль' }));
      }

      // Успешная аутентификация
      resolve(NextResponse.json({ success: true }));
    });
  });
}
