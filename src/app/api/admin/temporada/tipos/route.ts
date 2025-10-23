import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// Constantes para tipo_operacion
const TIPO_OPERACION = {
  ALQUILER: 1,
  VENTA: 2,
} as const

interface TemporadaConMultiplicadores {
  id_temporada: number
  nombre: string
  descripcion: string | null
  color_hex: string | null
  multiplicadores: {
    alquiler: number
    venta: number
  }
}

// GET - Obtener tipos de temporada con sus multiplicadores
export async function GET() {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todas las temporadas con sus multiplicadores activos
    const temporadas = await prisma.temporada.findMany({
      include: {
        multiplicadortemporada: {
          where: {
            activo: true,
            OR: [
              { fecha_fin: null },
              { fecha_fin: { gte: new Date() } },
            ],
          },
        },
      },
      orderBy: { nombre: 'asc' },
    })

    // Formatear la respuesta
    const temporadasFormateadas: TemporadaConMultiplicadores[] = temporadas.map((temp) => {
      const multAlquiler = temp.multiplicadortemporada.find(
        (m) => m.tipo_operacion === TIPO_OPERACION.ALQUILER && m.activo
      )
      const multVenta = temp.multiplicadortemporada.find(
        (m) => m.tipo_operacion === TIPO_OPERACION.VENTA && m.activo
      )

      return {
        id_temporada: temp.id_temporada,
        nombre: temp.nombre,
        descripcion: temp.descripcion,
        color_hex: temp.color_hex,
        multiplicadores: {
          alquiler: multAlquiler ? Number(multAlquiler.multiplicador) : 1.0,
          venta: multVenta ? Number(multVenta.multiplicador) : 1.0,
        },
      }
    })

    return NextResponse.json<
      ApiResponse<{ temporadas: TemporadaConMultiplicadores[] }>
    >(
      {
        success: true,
        data: {
          temporadas: temporadasFormateadas,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo tipos de temporada:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener tipos de temporada' },
      { status: 500 }
    )
  }
}
