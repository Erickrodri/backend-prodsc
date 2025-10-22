import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export const createUserSchema = z.object({
  id_personal: z.number().int().positive(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
})

// ============================================
// PERSONAL SCHEMAS
// ============================================

export const createPersonalSchema = z.object({
  ci: z.string().max(20),
  nombre: z.string().max(100),
  apellido: z.string().max(100),
  email: z.string().email().max(100).optional(),
  telefono: z.string().max(20).optional(),
  direccion: z.string().optional(),
  id_cargo: z.number().int().positive(),
  fecha_contratacion: z.string().or(z.date()),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
})

export const updatePersonalSchema = createPersonalSchema.partial()

// ============================================
// CLIENTE SCHEMAS
// ============================================

export const createClienteSchema = z.object({
  tipo_cliente: z.enum(['Natural', 'Juridico']),
  nit_ci: z.string().max(20),
  nombre_completo: z.string().max(200),
  razon_social: z.string().max(200).optional(),
  email: z.string().email().max(100),
  telefono: z.string().max(20),
  direccion: z.string(),
  ciudad: z.string().max(100),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
})

export const updateClienteSchema = createClienteSchema.partial()

// ============================================
// ESTRUCTURA MODULAR SCHEMAS
// ============================================

export const createEstructuraSchema = z.object({
  codigo: z.string().max(50),
  nombre: z.string().max(200),
  tipo_evento: z.string().max(100),
  descripcion_tecnica: z.string(),
  capacidad_personas: z.number().int().optional(),
  capacidad_peso_kg: z.number().optional(),
  dimensiones_largo: z.number().optional(),
  dimensiones_ancho: z.number().optional(),
  dimensiones_alto: z.number().optional(),
  materiales: z.string().optional(),
  tiempo_montaje_horas: z.number().int().optional(),
  personal_requerido_montaje: z.number().int().optional(),
  precio_base_venta: z.number().positive(),
  precio_base_alquiler_3dias: z.number().positive(),
  id_ingeniero_diseno: z.number().int().positive(),
  fecha_diseno: z.string().or(z.date()),
  plano_tecnico_url: z.string().url().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
})

export const updateEstructuraSchema = createEstructuraSchema.partial()

// ============================================
// PRODUCCIÓN SCHEMAS
// ============================================

export const createProduccionSchema = z.object({
  codigo_produccion: z.string().max(50),
  id_estructura: z.number().int().positive(),
  cantidad_producir: z.number().int().positive(),
  id_supervisor: z.number().int().positive(),
  fecha_inicio: z.string().or(z.date()),
  fecha_fin_estimada: z.string().or(z.date()),
  fecha_fin_real: z.string().or(z.date()).optional(),
  costo_total_produccion: z.number().optional(),
  estado: z.enum(['En Proceso', 'Completada', 'Cancelada']).optional(),
  observaciones: z.string().optional(),
})

export const updateProduccionSchema = createProduccionSchema.partial()

// ============================================
// ALQUILER SCHEMAS
// ============================================

export const createAlquilerSchema = z.object({
  codigo_alquiler: z.string().max(50),
  id_cliente: z.number().int().positive(),
  id_responsable: z.number().int().positive(),
  fecha_inicio_alquiler: z.string().or(z.date()),
  fecha_fin_alquiler: z.string().or(z.date()),
  periodos_3dias: z.number().int().positive(),
  subtotal_alquiler: z.number().positive(),
  subtotal_servicios: z.number().optional(),
  total_alquiler: z.number().positive(),
  metodo_pago: z.string().max(50),
  estado_pago: z.enum(['Pagado', 'Pendiente', 'Parcial']).optional(),
  ciudad_evento: z.string().max(100),
  direccion_evento: z.string(),
  distancia_km: z.number().optional(),
  estado_alquiler: z.enum(['Activo', 'Completado', 'Cancelado']).optional(),
  observaciones: z.string().optional(),
})

export const updateAlquilerSchema = createAlquilerSchema.partial()

export const createDetalleAlquilerSchema = z.object({
  id_alquiler: z.number().int().positive(),
  id_activo: z.number().int().positive(),
  precio_3dias: z.number().positive(),
  id_temporada_aplicada: z.number().int().optional(),
  multiplicador_aplicado: z.number().optional(),
  periodos_3dias: z.number().int().positive(),
  subtotal: z.number().positive(),
})

// ============================================
// VENTA SCHEMAS
// ============================================

export const createVentaSchema = z.object({
  codigo_venta: z.string().max(50),
  id_cliente: z.number().int().positive(),
  id_vendedor: z.number().int().positive(),
  subtotal_estructuras: z.number().positive(),
  subtotal_servicios: z.number().optional(),
  total_venta: z.number().positive(),
  metodo_pago: z.string().max(50),
  estado_pago: z.enum(['Pagado', 'Pendiente', 'Parcial']).optional(),
  ciudad_destino: z.string().max(100).optional(),
  direccion_destino: z.string().optional(),
  distancia_km: z.number().optional(),
  observaciones: z.string().optional(),
})

export const updateVentaSchema = createVentaSchema.partial()

export const createDetalleVentaSchema = z.object({
  id_venta: z.number().int().positive(),
  id_activo: z.number().int().positive(),
  precio_unitario: z.number().positive(),
  id_temporada_aplicada: z.number().int().optional(),
  multiplicador_aplicado: z.number().optional(),
  cantidad: z.number().int().positive().optional(),
  subtotal: z.number().positive(),
})

// ============================================
// CARGO SCHEMAS
// ============================================

export const createCargoSchema = z.object({
  nombre: z.string().max(100),
  descripcion: z.string().optional(),
  nivel_jerarquico: z.number().int().optional(),
  salario_base: z.number().optional(),
})

export const updateCargoSchema = createCargoSchema.partial()

// ============================================
// TIPOS INFERIDOS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreatePersonalInput = z.infer<typeof createPersonalSchema>
export type UpdatePersonalInput = z.infer<typeof updatePersonalSchema>
export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>
export type CreateEstructuraInput = z.infer<typeof createEstructuraSchema>
export type UpdateEstructuraInput = z.infer<typeof updateEstructuraSchema>
export type CreateProduccionInput = z.infer<typeof createProduccionSchema>
export type UpdateProduccionInput = z.infer<typeof updateProduccionSchema>
export type CreateAlquilerInput = z.infer<typeof createAlquilerSchema>
export type UpdateAlquilerInput = z.infer<typeof updateAlquilerSchema>
export type CreateVentaInput = z.infer<typeof createVentaSchema>
export type UpdateVentaInput = z.infer<typeof updateVentaSchema>
export type CreateCargoInput = z.infer<typeof createCargoSchema>
export type UpdateCargoInput = z.infer<typeof updateCargoSchema>
