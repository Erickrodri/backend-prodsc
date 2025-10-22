# Backend - Sistema de Producciones SC

Backend API REST para el sistema de gestión de estructuras modulares construido con Next.js 15, Prisma y PostgreSQL.

## 🚀 Características

- ✅ Autenticación JWT con cookies HTTP-only
- ✅ CRUD completo para todas las entidades
- ✅ Validación de datos con Zod
- ✅ Middleware de autenticación global
- ✅ Manejo de errores centralizado
- ✅ Paginación y filtros en listados
- ✅ Relaciones complejas entre entidades
- ✅ TypeScript con tipado estricto
- ✅ Sistema de permisos por cargo
- ✅ Registro de sesiones de usuario
- ✅ **Documentación API interactiva con Scalar**

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repo>
cd backend-prodsc
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://usuario:password@host:5432/database?schema=schema_name"
JWT_SECRET="tu_clave_secreta_super_segura"
JWT_EXPIRES_IN="8h"
NODE_ENV="development"
```

4. **Generar cliente de Prisma**
```bash
# Si ya tienes la base de datos creada
npx prisma db pull

# Generar el cliente
npx prisma generate
```

5. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

6. **Acceder a la documentación interactiva**
```
http://localhost:3000/docs
```

La documentación API interactiva te permite:
- 📖 Ver todos los endpoints disponibles
- 🧪 Probar las APIs directamente desde el navegador
- 📝 Ver ejemplos de request/response
- 🔐 Autenticarte y hacer peticiones reales

## 📁 Estructura del Proyecto

```
backend-prodsc/
├── prisma/
│   └── schema.prisma              # Schema de Prisma (24 modelos)
├── src/
│   ├── app/
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/              # Autenticación (login, logout)
│   │   │   ├── cargos/            # CRUD de Cargos
│   │   │   ├── personal/          # CRUD de Personal
│   │   │   ├── clientes/          # CRUD de Clientes
│   │   │   ├── estructuras/       # CRUD de Estructuras Modulares
│   │   │   ├── producciones/      # CRUD de Producciones
│   │   │   ├── ventas/            # CRUD de Ventas
│   │   │   └── alquileres/        # CRUD de Alquileres
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Cliente singleton de Prisma
│   │   ├── auth.ts                # Utilidades de JWT y bcrypt
│   │   ├── validations.ts         # Schemas de validación Zod
│   │   └── utils.ts               # Funciones auxiliares
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript compartidos
│   ├── middleware.ts              # Middleware de autenticación
│   └── generated/                 # Cliente de Prisma generado
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id_usuario": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "id_personal": 1,
      "personal": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com",
        "cargo": {
          "nombre": "Administrador"
        }
      }
    }
  },
  "message": "Inicio de sesión exitoso"
}
```

### Logout
```bash
POST /api/auth/logout
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

## 📚 Documentación de la API

### 🌐 Acceso a la documentación interactiva

Visita `http://localhost:3000/docs` para acceder a la documentación completa e interactiva de la API con Scalar.

**Características de la documentación:**
- 📖 Especificación OpenAPI 3.1
- 🎨 Interfaz moderna y responsive
- 🧪 Pruebas en vivo desde el navegador
- 📋 Ejemplos de código en múltiples lenguajes
- 🔐 Autenticación integrada
- 📊 Schemas de datos visualizados

### 📚 API Endpoints

### Cargos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cargos` | Listar cargos (paginado) |
| GET | `/api/cargos/:id` | Obtener cargo por ID |
| POST | `/api/cargos` | Crear nuevo cargo |
| PATCH | `/api/cargos/:id` | Actualizar cargo |
| DELETE | `/api/cargos/:id` | Eliminar cargo |

**Ejemplo - Listar cargos:**
```bash
GET /api/cargos?page=1&limit=10&search=admin&sortBy=nombre&sortOrder=asc
```

**Ejemplo - Crear cargo:**
```bash
POST /api/cargos
Content-Type: application/json

{
  "nombre": "Gerente",
  "descripcion": "Gerente general",
  "nivel_jerarquico": 1,
  "salario_base": 5000.00
}
```

### Personal
*(Por implementar - usar el mismo patrón que cargos)*

### Clientes
*(Por implementar - usar el mismo patrón que cargos)*

### Estructuras Modulares
*(Por implementar)*

### Producciones
*(Por implementar)*

### Alquileres
*(Por implementar)*

### Ventas
*(Por implementar)*

## 🗄️ Base de Datos

### Modelos Principales (24 tablas)

**Gestión de Usuarios y Permisos:**
- `usuario` - Usuarios del sistema
- `personal` - Empleados de la empresa
- `cargo` - Cargos/puestos de trabajo
- `permiso` - Permisos del sistema
- `cargopermiso` - Relación cargo-permiso
- `sesionlogin` - Sesiones activas

**Catálogos y Configuración:**
- `estructuramodular` - Diseños de estructuras
- `temporada` - Temporadas (alta/baja)
- `multiplicadortemporada` - Multiplicadores de precio
- `configuraciontemporada` - Config por mes
- `configuraciontransporte` - Costos de transporte
- `tiposervicio` - Tipos de servicios
- `servicioadicional` - Servicios disponibles

**Inventario:**
- `produccion` - Órdenes de producción
- `produccionpersonal` - Personal asignado
- `activofisico` - Unidades físicas
- `activoimagen` - Imágenes de activos
- `certificacion` - Certificaciones
- `mantenimiento` - Mantenimientos

**Operaciones:**
- `cliente` - Clientes
- `alquiler` - Contratos de alquiler
- `detallealquiler` - Items alquilados
- `servicioalquiler` - Servicios del alquiler
- `devolucion` - Devoluciones
- `venta` - Ventas
- `detalleventa` - Items vendidos
- `servicioventa` - Servicios de venta

## 🔒 Seguridad

- Autenticación JWT con cookies HTTP-only
- Contraseñas hasheadas con bcrypt (10 rounds)
- Middleware de autenticación global
- Bloqueo de cuenta después de 5 intentos fallidos
- Validación de datos con Zod
- Prevención de inyección SQL (Prisma ORM)
- CORS configurado

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm start

# Linting
npm run lint

# Prisma
npx prisma studio          # Interfaz visual de la BD
npx prisma db pull         # Traer schema desde DB
npx prisma generate        # Generar cliente
npx prisma migrate dev     # Crear migración
```

## 🧪 Pruebas con cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' \
  -c cookies.txt
```

**Listar cargos:**
```bash
curl -X GET http://localhost:3000/api/cargos \
  -b cookies.txt
```

## 📦 Dependencias Principales

- **next**: 15.5.6 - Framework React/Node.js
- **@prisma/client**: 6.17.1 - ORM para PostgreSQL
- **@scalar/nextjs-api-reference**: 0.8.23 - Documentación API interactiva
- **bcryptjs**: 3.0.2 - Hash de contraseñas
- **jsonwebtoken**: 9.0.2 - JWT para autenticación
- **zod**: 4.1.12 - Validación de schemas
- **date-fns**: 4.1.0 - Utilidades de fechas
- **typescript**: 5.x - Tipado estático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autores

- Equipo de desarrollo Producciones SC

## 🐛 Reportar Bugs

Reportar bugs en el sistema de issues del repositorio.

---

**Desarrollado con ❤️ usando Next.js + Prisma + PostgreSQL**
