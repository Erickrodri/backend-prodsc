import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCargoSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// GET - Obtener un cargo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const { id } = await params
    const cargoId = parseInt(id)

    if (isNaN(cargoId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const cargo = await prisma.cargo.findUnique({
      where: { id_cargo: cargoId },
      include: {
        personal: {
          select: {
            id_personal: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        cargopermiso: {
          include: {
            permiso: true,
          },
        },
      },
    })

    if (!cargo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cargo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<typeof cargo>>(
      { success: true, data: cargo },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo cargo:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener cargo' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar un cargo parcialmente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const cargoId = parseInt(id)

    if (isNaN(cargoId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateCargoSchema.parse(body)

    // Verificar si el cargo existe
    const existingCargo = await prisma.cargo.findUnique({
      where: { id_cargo: cargoId },
    })

    if (!existingCargo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cargo no encontrado' },
        { status: 404 }
      )
    }

    // Si se actualiza el nombre, verificar que no exista otro cargo con ese nombre
    if (validatedData.nombre && validatedData.nombre !== existingCargo.nombre) {
      const cargoWithSameName = await prisma.cargo.findUnique({
        where: { nombre: validatedData.nombre },
      })

      if (cargoWithSameName) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Ya existe un cargo con ese nombre' },
          { status: 409 }
        )
      }
    }

    // Actualizar cargo
    const cargo = await prisma.cargo.update({
      where: { id_cargo: cargoId },
      data: validatedData,
    })

    return NextResponse.json<ApiResponse<typeof cargo>>(
      {
        success: true,
        data: cargo,
        message: 'Cargo actualizado exitosamente',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando cargo:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al actualizar cargo' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un cargo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const cargoId = parseInt(id)

    if (isNaN(cargoId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar si el cargo existe
    const existingCargo = await prisma.cargo.findUnique({
      where: { id_cargo: cargoId },
      include: {
        _count: {
          select: {
            personal: true,
          },
        },
      },
    })

    if (!existingCargo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cargo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si hay personal asignado a este cargo
    if (existingCargo._count.personal > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No se puede eliminar el cargo porque tiene personal asignado',
        },
        { status: 409 }
      )
    }

    // Eliminar cargo
    await prisma.cargo.delete({
      where: { id_cargo: cargoId },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Cargo eliminado exitosamente',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error eliminando cargo:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al eliminar cargo' },
      { status: 500 }
    )
  }
}
