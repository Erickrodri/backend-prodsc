import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateMesTemporadaSchema } from '@/lib/validations'
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

// PUT - Actualizar temporada de un mes específico
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateMesTemporadaSchema.parse(body)

    const { anio, mes, id_temporada } = validatedData

    // Verificar que la temporada existe
    const temporada = await prisma.temporada.findUnique({
      where: { id_temporada },
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
    })

    if (!temporada) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Temporada no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe una configuración para este mes/año
    const existingConfig = await prisma.configuraciontemporada.findUnique({
      where: {
        mes_anio: {
          mes,
          anio,
        },
      },
    })

    if (existingConfig) {
      // Actualizar configuración existente
      await prisma.configuraciontemporada.update({
        where: {
          mes_anio: {
            mes,
            anio,
          },
        },
        data: {
          id_temporada,
          activo: true,
        },
      })
    } else {
      // Crear nueva configuración
      await prisma.configuraciontemporada.create({
        data: {
          mes,
          anio,
          id_temporada,
          activo: true,
        },
      })
    }

    // Obtener multiplicadores
    const multAlquiler = temporada.multiplicadortemporada.find(
      (m) => m.tipo_operacion === TIPO_OPERACION.ALQUILER && m.activo
    )
    const multVenta = temporada.multiplicadortemporada.find(
      (m) => m.tipo_operacion === TIPO_OPERACION.VENTA && m.activo
    )

    return NextResponse.json<
      ApiResponse<{
        mes: number
        nombre_mes: string
        anio: number
        id_temporada: number
        temporada_nombre: string
        color_hex: string | null
        multiplicadores: {
          alquiler: number
          venta: number
        }
      }>
    >(
      {
        success: true,
        message: 'Temporada actualizada correctamente',
        data: {
          mes,
          nombre_mes: NOMBRES_MESES[mes - 1],
          anio,
          id_temporada: temporada.id_temporada,
          temporada_nombre: temporada.nombre,
          color_hex: temporada.color_hex,
          multiplicadores: {
            alquiler: multAlquiler ? Number(multAlquiler.multiplicador) : 1.0,
            venta: multVenta ? Number(multVenta.multiplicador) : 1.0,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando temporada del mes:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al actualizar temporada del mes' },
      { status: 500 }
    )
  }
}
