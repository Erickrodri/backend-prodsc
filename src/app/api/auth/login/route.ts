import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken, getTokenExpirationDate } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import type { ApiResponse, AuthResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Parsear y validar datos de entrada
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Buscar usuario por username
    const usuario = await prisma.usuario.findUnique({
      where: { username: validatedData.username },
      include: {
        personal: {
          include: {
            cargo: true,
          },
        },
      },
    })

    // Verificar si el usuario existe
    if (!usuario) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar si el usuario está bloqueado
    if (usuario.bloqueado) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuario bloqueado. Contacte al administrador' },
        { status: 403 }
      )
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(
      validatedData.password,
      usuario.password_hash
    )

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: {
          intentos_fallidos: (usuario.intentos_fallidos || 0) + 1,
          bloqueado: (usuario.intentos_fallidos || 0) + 1 >= 5,
        },
      })

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Generar token JWT
    const token = generateToken({
      id_usuario: usuario.id_usuario,
      uuid: usuario.uuid,
      id_personal: usuario.id_personal,
      username: usuario.username,
    })

    // Obtener IP y User-Agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Crear sesión en la base de datos
    await prisma.sesionlogin.create({
      data: {
        id_usuario: usuario.id_usuario,
        token_jwt: token,
        ip_address: ip.substring(0, 45), // Limitar a 45 caracteres
        user_agent: userAgent,
        fecha_expiracion: getTokenExpirationDate(),
        activa: true,
      },
    })

    // Actualizar último acceso y resetear intentos fallidos
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        ultimo_acceso: new Date(),
        intentos_fallidos: 0,
      },
    })

    // Preparar respuesta
    const authResponse: AuthResponse = {
      token,
      user: {
        id_usuario: usuario.id_usuario,
        uuid: usuario.uuid,
        username: usuario.username,
        id_personal: usuario.id_personal,
        personal: {
          nombre: usuario.personal.nombre,
          apellido: usuario.personal.apellido,
          email: usuario.personal.email || undefined,
          cargo: {
            nombre: usuario.personal.cargo.nombre,
          },
        },
      },
    }

    // Crear respuesta con cookie
    const response = NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: authResponse,
        message: 'Inicio de sesión exitoso',
      },
      { status: 200 }
    )

    // Establecer cookie con el token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error en login:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
