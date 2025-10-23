import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updatePersonalSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// GET - Obtener un personal por ID
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
    const personalId = parseInt(id)

    if (isNaN(personalId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const personal = await prisma.personal.findUnique({
      where: { id_personal: personalId },
      include: {
        cargo: {
          select: {
            id_cargo: true,
            nombre: true,
            descripcion: true,
            nivel_jerarquico: true,
            salario_base: true,
          },
        },
        usuario: {
          select: {
            id_usuario: true,
            username: true,
            uuid: true,
            ultimo_acceso: true,
            bloqueado: true,
          },
        },
        _count: {
          select: {
            alquiler: true,
            venta: true,
            produccion: true,
            estructuramodular: true,
            mantenimiento: true,
            produccionpersonal: true,
          },
        },
      },
    })

    if (!personal) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Personal no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<typeof personal>>(
      { success: true, data: personal },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo personal:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener personal' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar un personal parcialmente
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
    const personalId = parseInt(id)

    if (isNaN(personalId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updatePersonalSchema.parse(body)

    // Verificar si el personal existe
    const existingPersonal = await prisma.personal.findUnique({
      where: { id_personal: personalId },
    })

    if (!existingPersonal) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Personal no encontrado' },
        { status: 404 }
      )
    }

    // Si se actualiza el CI, verificar que no exista otro personal con ese CI
    if (validatedData.ci && validatedData.ci !== existingPersonal.ci) {
      const personalWithSameCi = await prisma.personal.findUnique({
        where: { ci: validatedData.ci },
      })

      if (personalWithSameCi) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Ya existe un personal con ese CI' },
          { status: 409 }
        )
      }
    }

    // Si se actualiza el email, verificar que no exista otro personal con ese email
    if (validatedData.email && validatedData.email !== existingPersonal.email) {
      const personalWithSameEmail = await prisma.personal.findUnique({
        where: { email: validatedData.email },
      })

      if (personalWithSameEmail) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Ya existe un personal con ese email' },
          { status: 409 }
        )
      }
    }

    // Si se actualiza el cargo, verificar que existe
    if (validatedData.id_cargo) {
      const cargo = await prisma.cargo.findUnique({
        where: { id_cargo: validatedData.id_cargo },
      })

      if (!cargo) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'El cargo especificado no existe' },
          { status: 404 }
        )
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate: {
      ci?: string
      nombre?: string
      apellido?: string
      email?: string | null
      telefono?: string | null
      direccion?: string | null
      id_cargo?: number
      fecha_contratacion?: Date | string
      estado?: string
    } = { ...validatedData }

    // Convertir fecha_contratacion a Date si es string
    if (validatedData.fecha_contratacion) {
      dataToUpdate.fecha_contratacion =
        typeof validatedData.fecha_contratacion === 'string'
          ? new Date(validatedData.fecha_contratacion)
          : validatedData.fecha_contratacion
    }

    // Actualizar personal
    const personal = await prisma.personal.update({
      where: { id_personal: personalId },
      data: dataToUpdate,
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
      },
    })

    return NextResponse.json<ApiResponse<typeof personal>>(
      {
        success: true,
        data: personal,
        message: 'Personal actualizado exitosamente',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando personal:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos de entrada inválidos' },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al actualizar personal' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un personal
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
    const personalId = parseInt(id)

    if (isNaN(personalId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar si el personal existe
    const existingPersonal = await prisma.personal.findUnique({
      where: { id_personal: personalId },
      include: {
        usuario: true,
        _count: {
          select: {
            alquiler: true,
            venta: true,
            produccion: true,
            estructuramodular: true,
            mantenimiento: true,
            produccionpersonal: true,
          },
        },
      },
    })

    if (!existingPersonal) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Personal no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene usuario asociado
    if (existingPersonal.usuario) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No se puede eliminar el personal porque tiene un usuario asociado',
        },
        { status: 409 }
      )
    }

    // Verificar si tiene registros relacionados
    const hasRelatedRecords =
      existingPersonal._count.alquiler > 0 ||
      existingPersonal._count.venta > 0 ||
      existingPersonal._count.produccion > 0 ||
      existingPersonal._count.estructuramodular > 0 ||
      existingPersonal._count.mantenimiento > 0 ||
      existingPersonal._count.produccionpersonal > 0

    if (hasRelatedRecords) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error:
            'No se puede eliminar el personal porque tiene registros relacionados (alquileres, ventas, producciones, etc.)',
        },
        { status: 409 }
      )
    }

    // Eliminar personal
    await prisma.personal.delete({
      where: { id_personal: personalId },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Personal eliminado exitosamente',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error eliminando personal:', error)

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al eliminar personal' },
      { status: 500 }
    )
  }
}
