import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromCookies } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = await getTokenFromCookies()

    if (token) {
      // Marcar sesión como inactiva en la base de datos
      await prisma.sesionlogin.updateMany({
        where: {
          token_jwt: token,
          activa: true,
        },
        data: {
          activa: false,
        },
      })
    }

    // Crear respuesta
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Sesión cerrada exitosamente',
      },
      { status: 200 }
    )

    // Eliminar cookie
    response.cookies.delete('token')

    return response
  } catch (error) {
    console.error('Error en logout:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
