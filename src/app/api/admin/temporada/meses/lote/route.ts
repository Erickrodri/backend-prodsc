import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateMesesLoteSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// PUT - Actualizar temporadas en lote (varios meses)
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
    const validatedData = updateMesesLoteSchema.parse(body)

    const { anio, actualizaciones } = validatedData

    // Verificar que todas las temporadas existen
    const temporadaIds = [...new Set(actualizaciones.map((a) => a.id_temporada))]
    const temporadas = await prisma.temporada.findMany({
      where: {
        id_temporada: {
          in: temporadaIds,
        },
      },
    })

    if (temporadas.length !== temporadaIds.length) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Una o más temporadas no existen' },
        { status: 404 }
      )
    }

    // Verificar que no haya meses duplicados en la solicitud
    const meses = actualizaciones.map((a) => a.mes)
    const mesesUnicos = new Set(meses)
    if (meses.length !== mesesUnicos.size) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No se pueden actualizar el mismo mes múltiples veces' },
        { status: 400 }
      )
    }

    // Ejecutar todas las actualizaciones en una transacción
    const resultados = await prisma.$transaction(
      actualizaciones.map(({ mes, id_temporada }) =>
        prisma.configuraciontemporada.upsert({
          where: {
            mes_anio: {
              mes,
              anio,
            },
          },
          update: {
            id_temporada,
            activo: true,
          },
          create: {
            mes,
            anio,
            id_temporada,
            activo: true,
          },
        })
      )
    )

    return NextResponse.json<
      ApiResponse<{
        actualizados: number
        meses: Array<{ mes: number; id_temporada: number }>
      }>
    >(
      {
        success: true,
        message: `${resultados.length} meses actualizados correctamente`,
        data: {
          actualizados: resultados.length,
          meses: actualizaciones.map(({ mes, id_temporada }) => ({
            mes,
            id_temporada,
          })),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando temporadas en lote:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al actualizar temporadas en lote' },
      { status: 500 }
    )
  }
}
