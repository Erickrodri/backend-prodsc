# Guía de Desarrollo - Backend ProdSC

## 🎯 Cómo crear nuevos endpoints

### 1. Definir validaciones en `src/lib/validations.ts`

```typescript
export const createMiEntidadSchema = z.object({
  nombre: z.string().min(3).max(100),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
})

export const updateMiEntidadSchema = createMiEntidadSchema.partial()

export type CreateMiEntidadInput = z.infer<typeof createMiEntidadSchema>
export type UpdateMiEntidadInput = z.infer<typeof updateMiEntidadSchema>
```

### 2. Crear archivo de ruta `src/app/api/mi-entidad/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMiEntidadSchema } from '@/lib/validations'
import type { ApiResponse, PaginatedResponse } from '@/types'

// GET - Listar con paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [total, items] = await Promise.all([
      prisma.miEntidad.count(),
      prisma.miEntidad.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ])

    const response: PaginatedResponse<typeof items[0]> = {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener datos' },
      { status: 500 }
    )
  }
}

// POST - Crear
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMiEntidadSchema.parse(body)

    const item = await prisma.miEntidad.create({
      data: validatedData,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, data: item, message: 'Creado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al crear' },
      { status: 500 }
    )
  }
}
```

### 3. Crear rutas dinámicas `src/app/api/mi-entidad/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateMiEntidadSchema } from '@/lib/validations'
import type { ApiResponse } from '@/types'

// GET - Obtener por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const item = await prisma.miEntidad.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({ success: true, data: item })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al obtener' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)
    const body = await request.json()
    const validatedData = updateMiEntidadSchema.parse(body)

    const item = await prisma.miEntidad.update({
      where: { id: itemId },
      data: validatedData,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, data: item, message: 'Actualizado exitosamente' }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al actualizar' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    await prisma.miEntidad.delete({
      where: { id: itemId },
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Eliminado exitosamente' }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al eliminar' },
      { status: 500 }
    )
  }
}
```

## 🔐 Acceder al usuario autenticado

```typescript
import { getUserFromHeaders } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Opción 1: Desde headers (más rápido)
  const userHeaders = getUserFromHeaders(request)
  const userId = parseInt(userHeaders?.['x-user-id'] || '0')

  // Opción 2: Decodificar token (más completo)
  const currentUser = await getCurrentUser()

  // Usar el usuario...
}
```

## 📊 Ejemplos de consultas complejas con Prisma

### Incluir relaciones
```typescript
const alquiler = await prisma.alquiler.findUnique({
  where: { id_alquiler: 1 },
  include: {
    cliente: true,
    personal: true,
    detallealquiler: {
      include: {
        activofisico: {
          include: {
            estructuramodular: true,
          },
        },
      },
    },
    servicioalquiler: {
      include: {
        servicioadicional: true,
      },
    },
  },
})
```

### Búsqueda y filtros
```typescript
const clientes = await prisma.cliente.findMany({
  where: {
    AND: [
      { estado: 'Activo' },
      {
        OR: [
          { nombre_completo: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { nit_ci: { contains: search } },
        ],
      },
    ],
  },
  orderBy: { fecha_registro: 'desc' },
  take: 10,
})
```

### Agregaciones
```typescript
const estadisticas = await prisma.venta.aggregate({
  _sum: { total_venta: true },
  _avg: { total_venta: true },
  _count: { id_venta: true },
  where: {
    fecha_venta: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31'),
    },
  },
})
```

### Transacciones
```typescript
const resultado = await prisma.$transaction(async (tx) => {
  // Crear alquiler
  const alquiler = await tx.alquiler.create({
    data: alquilerData,
  })

  // Crear detalles
  await tx.detallealquiler.createMany({
    data: detalles.map(d => ({
      ...d,
      id_alquiler: alquiler.id_alquiler,
    })),
  })

  // Actualizar estado de activos
  await tx.activofisico.updateMany({
    where: { id_activo: { in: activosIds } },
    data: { estado_fisico: 'Alquilado' },
  })

  return alquiler
})
```

## 🛠️ Utilidades comunes

### Generar códigos únicos
```typescript
import { generateCode } from '@/lib/utils'

const codigo = generateCode('ALQ', alquiler.id_alquiler)
// Resultado: ALQ-000123
```

### Calcular periodos de 3 días
```typescript
import { calculate3DayPeriods } from '@/lib/utils'

const periodos = calculate3DayPeriods(
  new Date('2024-01-01'),
  new Date('2024-01-10')
)
// Resultado: 4 periodos
```

### Formatear moneda
```typescript
import { formatCurrency } from '@/lib/utils'

const formatted = formatCurrency(1500.50)
// Resultado: "Bs 1.500,50"
```

## 🧪 Testing con Thunder Client / Postman

### Variables de entorno
```json
{
  "base_url": "http://localhost:3000",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Colección de requests

**1. Login**
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

**2. Listar con filtros**
```
GET {{base_url}}/api/cargos?page=1&limit=10&search=admin&sortBy=nombre
Cookie: token={{token}}
```

**3. Crear**
```
POST {{base_url}}/api/cargos
Cookie: token={{token}}
Content-Type: application/json

{
  "nombre": "Supervisor",
  "descripcion": "Supervisor de producción",
  "nivel_jerarquico": 3,
  "salario_base": 3500.00
}
```

**4. Actualizar**
```
PATCH {{base_url}}/api/cargos/1
Cookie: token={{token}}
Content-Type: application/json

{
  "salario_base": 4000.00
}
```

**5. Eliminar**
```
DELETE {{base_url}}/api/cargos/1
Cookie: token={{token}}
```

## 📝 Buenas prácticas

### 1. Manejo de errores
```typescript
try {
  // Código que puede fallar
} catch (error) {
  console.error('Error detallado:', error)

  // Respuesta genérica al usuario
  return NextResponse.json<ApiResponse>(
    { success: false, error: 'Error al procesar solicitud' },
    { status: 500 }
  )
}
```

### 2. Validación siempre
```typescript
// ✅ Correcto
const validatedData = createSchema.parse(body)

// ❌ Incorrecto (sin validación)
const data = body
```

### 3. Usar tipos
```typescript
// ✅ Correcto
import type { ApiResponse } from '@/types'
return NextResponse.json<ApiResponse>({ success: true })

// ❌ Incorrecto (sin tipos)
return NextResponse.json({ success: true })
```

### 4. Paginación siempre en listados
```typescript
// ✅ Correcto
const items = await prisma.tabla.findMany({ take: limit, skip })

// ❌ Incorrecto (sin límite)
const items = await prisma.tabla.findMany()
```

### 5. Índices en búsquedas
```prisma
// En schema.prisma
model Cliente {
  // ...
  @@index([email])
  @@index([nit_ci])
  @@index([estado])
}
```

## 🚀 Despliegue

### Variables de entorno en producción
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="clave_super_segura_de_al_menos_32_caracteres"
JWT_EXPIRES_IN="8h"
NODE_ENV="production"
```

### Build
```bash
npm run build
npm start
```

### Vercel
```bash
vercel --prod
```

---

**Última actualización:** 2025-10-21
