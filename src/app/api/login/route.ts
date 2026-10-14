import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (validUsername && validPassword && username === validUsername && password === validPassword) {
      const token = await createSessionToken();
      if (!token) {
        return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
      }
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: SESSION_COOKIE,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
