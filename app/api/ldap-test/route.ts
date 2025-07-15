import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import ActiveDirectory from 'activedirectory2'

export async function POST(req: any) {
  const { host, port, user, password, ssl, baseDN } = await req.json();
  const url = `${ssl ? 'ldaps' : 'ldap'}://${host}:${port}`;
  const ad = new ActiveDirectory({
    url,
    baseDN: baseDN || '',
    username: user,
    password,
  });

  return new Promise((resolve) => {
    ad.authenticate(user, password, (err: any, auth: boolean) => {
      if (err) {
        return resolve(NextResponse.json({ success: false, error: err.message }));
      }
      if (!auth) {
        return resolve(NextResponse.json({ success: false, error: 'Неверный логин или пароль' }));
      }
      resolve(NextResponse.json({ success: true }));
    });
  });
} 