import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCargoSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse, PaginatedResponse } from '@/types'

// GET - Listar todos los cargos con paginación
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'nombre'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' as const } },
            { descripcion: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Obtener total de registros
    const total = await prisma.cargo.count({ where })

    // Obtener cargos paginados
    const cargos = await prisma.cargo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            personal: true,
            cargopermiso: true,
          },
        },
      },
    })

    const response: PaginatedResponse<typeof cargos[0]> = {
      success: true,
      data: cargos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo cargos:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener cargos' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo cargo
export async function POST(request: NextRequest) {
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
    const validatedData = createCargoSchema.parse(body)

    // Verificar si ya existe un cargo con el mismo nombre
    const existingCargo = await prisma.cargo.findUnique({
      where: { nombre: validatedData.nombre },
    })

    if (existingCargo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ya existe un cargo con ese nombre' },
        { status: 409 }
      )
    }

    // Crear cargo
    const cargo = await prisma.cargo.create({
      data: validatedData,
    })

    return NextResponse.json<ApiResponse<typeof cargo>>(
      {
        success: true,
        data: cargo,
        message: 'Cargo creado exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando cargo:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al crear cargo' },
      { status: 500 }
    )
  }
}
