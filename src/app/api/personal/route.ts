import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPersonalSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse, PaginatedResponse } from '@/types'

// GET - Listar todo el personal con paginación
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
    const estado = searchParams.get('estado') || ''
    const id_cargo = searchParams.get('id_cargo') || ''
    const sortBy = searchParams.get('sortBy') || 'nombre'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const where: {
      OR?: Array<{
        nombre?: { contains: string; mode: 'insensitive' }
        apellido?: { contains: string; mode: 'insensitive' }
        ci?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
      }>
      estado?: string
      id_cargo?: number
    } = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' as const } },
        { apellido: { contains: search, mode: 'insensitive' as const } },
        { ci: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    if (estado) {
      where.estado = estado
    }

    if (id_cargo) {
      where.id_cargo = parseInt(id_cargo)
    }

    // Obtener total de registros
    const total = await prisma.personal.count({ where })

    // Obtener personal paginado
    const personal = await prisma.personal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        cargo: {
          select: {
            id_cargo: true,
            nombre: true,
            nivel_jerarquico: true,
          },
        },
        usuario: {
          select: {
            id_usuario: true,
            username: true,
            uuid: true,
          },
        },
        _count: {
          select: {
            alquiler: true,
            venta: true,
            produccion: true,
            estructuramodular: true,
          },
        },
      },
    })

    const response: PaginatedResponse<typeof personal[0]> = {
      success: true,
      data: personal,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo personal:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener personal' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo personal
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
    const validatedData = createPersonalSchema.parse(body)

    // Verificar si ya existe un personal con el mismo CI
    const existingPersonalByCi = await prisma.personal.findUnique({
      where: { ci: validatedData.ci },
    })

    if (existingPersonalByCi) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ya existe un personal con ese CI' },
        { status: 409 }
      )
    }

    // Verificar si ya existe un personal con el mismo email (si se proporcionó)
    if (validatedData.email) {
      const existingPersonalByEmail = await prisma.personal.findUnique({
        where: { email: validatedData.email },
      })

      if (existingPersonalByEmail) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Ya existe un personal con ese email' },
          { status: 409 }
        )
      }
    }

    // Verificar que el cargo existe
    const cargo = await prisma.cargo.findUnique({
      where: { id_cargo: validatedData.id_cargo },
    })

    if (!cargo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'El cargo especificado no existe' },
        { status: 404 }
      )
    }

    // Convertir fecha_contratacion a Date si es string
    const fechaContratacion =
      typeof validatedData.fecha_contratacion === 'string'
        ? new Date(validatedData.fecha_contratacion)
        : validatedData.fecha_contratacion

    // Crear personal
    const personal = await prisma.personal.create({
      data: {
        ...validatedData,
        fecha_contratacion: fechaContratacion,
      },
      include: {
        cargo: {
          select: {
            id_cargo: true,
            nombre: true,
            nivel_jerarquico: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse<typeof personal>>(
      {
        success: true,
        data: personal,
        message: 'Personal creado exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando personal:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al crear personal' },
      { status: 500 }
    )
  }
}
