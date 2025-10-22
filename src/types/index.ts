// ============================================
// TIPOS DE RESPUESTA API
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================
// TIPOS DE ERROR
// ============================================

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

// ============================================
// TIPOS DE AUTENTICACIÓN
// ============================================

export interface AuthResponse {
  token: string
  user: {
    id_usuario: number
    uuid: string
    username: string
    id_personal: number
    personal: {
      nombre: string
      apellido: string
      email?: string
      cargo: {
        nombre: string
      }
    }
  }
}

export interface UserSession {
  id_usuario: number
  uuid: string
  id_personal: number
  username: string
}

// ============================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ============================================

export interface QueryFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  estado?: string
}

// ============================================
// TIPOS PARA ESTADÍSTICAS Y REPORTES
// ============================================

export interface EstadisticasVentas {
  total_ventas: number
  monto_total: number
  promedio_venta: number
  ventas_por_mes: {
    mes: string
    cantidad: number
    monto: number
  }[]
}

export interface EstadisticasAlquileres {
  total_alquileres: number
  monto_total: number
  promedio_alquiler: number
  alquileres_activos: number
  alquileres_por_mes: {
    mes: string
    cantidad: number
    monto: number
  }[]
}

export interface EstadisticasProduccion {
  total_producciones: number
  en_proceso: number
  completadas: number
  canceladas: number
  costo_total: number
}

export interface EstadisticasInventario {
  total_activos: number
  disponibles: number
  en_alquiler: number
  en_mantenimiento: number
  vendidos: number
}

// ============================================
// TIPOS DE ESTADO
// ============================================

export type EstadoGeneral = 'Activo' | 'Inactivo'
export type EstadoPago = 'Pagado' | 'Pendiente' | 'Parcial'
export type EstadoAlquiler = 'Activo' | 'Completado' | 'Cancelado'
export type EstadoProduccion = 'En Proceso' | 'Completada' | 'Cancelada'
export type EstadoActivo = 'Disponible' | 'Alquilado' | 'Vendido' | 'En Mantenimiento' | 'Dañado'
export type EstadoMantenimiento = 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado'
export type TipoCliente = 'Natural' | 'Juridico'
export type TipoOperacion = 'Venta' | 'Alquiler'
export type TipoMantenimiento = 'Preventivo' | 'Correctivo' | 'Emergencia'

// ============================================
// TIPOS DE REQUEST HEADERS
// ============================================

export interface AuthHeaders {
  'x-user-id': string
  'x-user-uuid': string
  'x-user-personal-id': string
  'x-username': string
}
