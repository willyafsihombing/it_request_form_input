import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password } = body; // login bisa email atau username

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Login dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user by email atau username
    const user = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { emailAddrs:    login.toLowerCase() },
          { userName: login.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email/username atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email/username atau password salah' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id:          user.id,
      emailAddrs:  user.emailAddrs,
      userName:    user.userName,
      role:        user.role,
      department:  user.department,
      titleUser:   user.titleUser,
      fullName:    user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id:          user.id,
        emailAddrs:  user.emailAddrs,
        userName:    user.userName,
        fullName:    user.fullName,
        role:        user.role,
        department:  user.department,
        titleUser:   user.titleUser,
      },
    });

    // Set cookie httpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7, // 7 hari
      path:     '/',
    });

    return response;

  } catch (err) {
    console.error('POST /api/auth/login:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}