import { NextRequest } from 'next/server'
import type { AuthHeaders } from '@/types'

/**
 * Extrae información del usuario autenticado desde los headers
 */
export function getUserFromHeaders(request: NextRequest): AuthHeaders | null {
  const userId = request.headers.get('x-user-id')
  const uuid = request.headers.get('x-user-uuid')
  const personalId = request.headers.get('x-user-personal-id')
  const username = request.headers.get('x-username')

  if (!userId || !uuid || !personalId || !username) {
    return null
  }

  return {
    'x-user-id': userId,
    'x-user-uuid': uuid,
    'x-user-personal-id': personalId,
    'x-username': username,
  }
}

/**
 * Formatea mensajes de error de Prisma
 */
export function formatPrismaError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const prismaError = error as { code?: string; meta?: { target?: string[] } }

    switch (prismaError.code) {
      case 'P2002':
        return `Ya existe un registro con ese ${prismaError.meta?.target?.join(', ') || 'valor'}`
      case 'P2003':
        return 'Referencia inválida a otro registro'
      case 'P2025':
        return 'Registro no encontrado'
      default:
        return 'Error en la base de datos'
    }
  }

  return 'Error desconocido'
}

/**
 * Genera un código único para registros
 */
export function generateCode(prefix: string, id: number): string {
  const paddedId = id.toString().padStart(6, '0')
  return `${prefix}-${paddedId}`
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula el número de periodos de 3 días entre dos fechas
 */
export function calculate3DayPeriods(startDate: Date, endDate: Date): number {
  const days = getDaysDifference(startDate, endDate)
  return Math.ceil(days / 3)
}

/**
 * Formatea un número como moneda boliviana
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(amount)
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Convierte un string a Date de forma segura
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString)
  return isValidDate(date) ? date : null
}

/**
 * Sanitiza strings para prevenir inyecciones
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '')
}

/**
 * Genera un UUID v4 simple
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Verifica si un valor es un número válido
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Redondea un número a N decimales
 */
export function roundToDecimals(num: number, decimals: number = 2): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
