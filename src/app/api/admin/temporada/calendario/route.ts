import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// Constantes para tipo_operacion
const TIPO_OPERACION = {
  ALQUILER: 1,
  VENTA: 2,
} as const

// Nombres de meses en español
const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

interface MesCalendario {
  mes: number
  nombre: string
  id_temporada: number | null
  temporada_nombre: string | null
  color_hex: string | null
  multiplicadores: {
    alquiler: number
    venta: number
  }
}

// GET - Obtener calendario de temporadas por año
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const anio = parseInt(searchParams.get('anio') || new Date().getFullYear().toString())

    if (isNaN(anio) || anio < 2000 || anio > 2100) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Año inválido' },
        { status: 400 }
      )
    }

    // Obtener todas las configuraciones del año
    const configuraciones = await prisma.configuraciontemporada.findMany({
      where: { anio },
      include: {
        temporada: {
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
        },
      },
      orderBy: { mes: 'asc' },
    })

    // Crear un mapa de configuraciones por mes
    const configMap = new Map(configuraciones.map((c) => [c.mes, c]))

    // Construir el calendario completo (12 meses)
    const meses: MesCalendario[] = Array.from({ length: 12 }, (_, i) => {
      const numeroMes = i + 1
      const config = configMap.get(numeroMes)

      if (!config || !config.temporada) {
        return {
          mes: numeroMes,
          nombre: NOMBRES_MESES[i],
          id_temporada: null,
          temporada_nombre: null,
          color_hex: null,
          multiplicadores: {
            alquiler: 1.0,
            venta: 1.0,
          },
        }
      }

      // Obtener multiplicadores activos
      const multAlquiler = config.temporada.multiplicadortemporada.find(
        (m) => m.tipo_operacion === TIPO_OPERACION.ALQUILER && m.activo
      )
      const multVenta = config.temporada.multiplicadortemporada.find(
        (m) => m.tipo_operacion === TIPO_OPERACION.VENTA && m.activo
      )

      return {
        mes: numeroMes,
        nombre: NOMBRES_MESES[i],
        id_temporada: config.temporada.id_temporada,
        temporada_nombre: config.temporada.nombre,
        color_hex: config.temporada.color_hex,
        multiplicadores: {
          alquiler: multAlquiler ? Number(multAlquiler.multiplicador) : 1.0,
          venta: multVenta ? Number(multVenta.multiplicador) : 1.0,
        },
      }
    })

    return NextResponse.json<ApiResponse<{ anio: number; meses: MesCalendario[] }>>(
      {
        success: true,
        data: {
          anio,
          meses,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo calendario de temporadas:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener calendario de temporadas' },
      { status: 500 }
    )
  }
}
