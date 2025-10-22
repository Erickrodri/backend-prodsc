export const openApiSpec = JSON.parse(JSON.stringify({
  openapi: '3.1.0',
  info: {
    title: 'Backend ProdSC - API de Gestión de Estructuras Modulares',
    version: '1.0.0',
    description: `
API REST para el sistema de gestión de producción, venta y alquiler de estructuras modulares.

## Características principales:
- 🔐 Autenticación JWT con cookies HTTP-only
- 📊 Gestión completa de inventario de estructuras
- 💰 Sistema de ventas y alquileres
- 👥 Administración de personal y clientes
- 🏭 Control de producción
- 📈 Precios dinámicos por temporada
- 🚚 Cálculo de costos de transporte

## Autenticación:
Todos los endpoints (excepto login) requieren autenticación mediante JWT almacenado en cookies HTTP-only.
    `,
    contact: {
      name: 'Equipo Producciones SC',
      email: 'soporte@produccionessc.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo',
    },
    {
      url: 'https://api.produccionessc.com',
      description: 'Servidor de producción',
    },
  ],
  tags: [
    {
      name: 'Autenticación',
      description: 'Endpoints de autenticación y gestión de sesiones',
    },
    {
      name: 'Cargos',
      description: 'Gestión de cargos y puestos de trabajo',
    },
    {
      name: 'Personal',
      description: 'Gestión de empleados',
    },
    {
      name: 'Clientes',
      description: 'Gestión de clientes',
    },
    {
      name: 'Estructuras',
      description: 'Catálogo de estructuras modulares',
    },
    {
      name: 'Producciones',
      description: 'Órdenes de producción',
    },
    {
      name: 'Alquileres',
      description: 'Gestión de alquileres',
    },
    {
      name: 'Ventas',
      description: 'Gestión de ventas',
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        description: 'Autentica un usuario y devuelve un token JWT en una cookie HTTP-only',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: {
                    type: 'string',
                    minLength: 3,
                    example: 'admin',
                    description: 'Nombre de usuario',
                  },
                  password: {
                    type: 'string',
                    minLength: 6,
                    example: '123456',
                    description: 'Contraseña del usuario',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Inicio de sesión exitoso' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                        user: {
                          type: 'object',
                          properties: {
                            id_usuario: { type: 'integer', example: 1 },
                            uuid: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                            username: { type: 'string', example: 'admin' },
                            id_personal: { type: 'integer', example: 1 },
                            personal: {
                              type: 'object',
                              properties: {
                                nombre: { type: 'string', example: 'Juan' },
                                apellido: { type: 'string', example: 'Pérez' },
                                email: { type: 'string', example: 'juan@example.com' },
                                cargo: {
                                  type: 'object',
                                  properties: {
                                    nombre: { type: 'string', example: 'Administrador' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Usuario bloqueado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Autenticación'],
        summary: 'Cerrar sesión',
        description: 'Cierra la sesión actual del usuario',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Sesión cerrada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Sesión cerrada exitosamente' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/cargos': {
      get: {
        tags: ['Cargos'],
        summary: 'Listar cargos',
        description: 'Obtiene una lista paginada de cargos con filtros opcionales',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1, minimum: 1 },
            description: 'Número de página',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
            description: 'Cantidad de registros por página',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Búsqueda en nombre y descripción',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', default: 'nombre', enum: ['nombre', 'nivel_jerarquico', 'salario_base', 'fecha_creacion'] },
            description: 'Campo por el cual ordenar',
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            description: 'Orden ascendente o descendente',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de cargos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Cargo' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 50 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Cargos'],
        summary: 'Crear cargo',
        description: 'Crea un nuevo cargo en el sistema',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCargo' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Cargo creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cargo creado exitosamente' },
                    data: { $ref: '#/components/schemas/Cargo' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'El cargo ya existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/cargos/{id}': {
      get: {
        tags: ['Cargos'],
        summary: 'Obtener cargo por ID',
        description: 'Obtiene los detalles de un cargo específico',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del cargo',
          },
        ],
        responses: {
          '200': {
            description: 'Detalles del cargo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CargoDetallado' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Cargo no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Cargos'],
        summary: 'Actualizar cargo',
        description: 'Actualiza los datos de un cargo existente',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del cargo',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCargo' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cargo actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cargo actualizado exitosamente' },
                    data: { $ref: '#/components/schemas/Cargo' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Cargo no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Cargos'],
        summary: 'Eliminar cargo',
        description: 'Elimina un cargo del sistema (solo si no tiene personal asignado)',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del cargo',
          },
        ],
        responses: {
          '200': {
            description: 'Cargo eliminado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cargo eliminado exitosamente' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Cargo no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'No se puede eliminar porque tiene personal asignado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Token JWT almacenado en cookie HTTP-only',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Descripción del error' },
        },
      },
      Cargo: {
        type: 'object',
        properties: {
          id_cargo: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Gerente General' },
          descripcion: { type: 'string', nullable: true, example: 'Responsable de la gestión general' },
          nivel_jerarquico: { type: 'integer', nullable: true, example: 1 },
          salario_base: { type: 'number', format: 'decimal', nullable: true, example: 5000.00 },
          fecha_creacion: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
          _count: {
            type: 'object',
            properties: {
              personal: { type: 'integer', example: 5 },
              cargopermiso: { type: 'integer', example: 10 },
            },
          },
        },
      },
      CargoDetallado: {
        allOf: [
          { $ref: '#/components/schemas/Cargo' },
          {
            type: 'object',
            properties: {
              personal: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id_personal: { type: 'integer', example: 1 },
                    nombre: { type: 'string', example: 'Juan' },
                    apellido: { type: 'string', example: 'Pérez' },
                    email: { type: 'string', nullable: true, example: 'juan@example.com' },
                  },
                },
              },
              cargopermiso: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id_cargo_permiso: { type: 'integer', example: 1 },
                    permiso: {
                      type: 'object',
                      properties: {
                        id_permiso: { type: 'integer', example: 1 },
                        codigo: { type: 'string', example: 'CREAR_VENTA' },
                        nombre: { type: 'string', example: 'Crear Ventas' },
                        modulo: { type: 'string', example: 'Ventas' },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      CreateCargo: {
        type: 'object',
        required: ['nombre'],
        properties: {
          nombre: { type: 'string', minLength: 1, maxLength: 100, example: 'Gerente General' },
          descripcion: { type: 'string', nullable: true, example: 'Responsable de la gestión general' },
          nivel_jerarquico: { type: 'integer', nullable: true, example: 1 },
          salario_base: { type: 'number', format: 'decimal', nullable: true, example: 5000.00 },
        },
      },
      UpdateCargo: {
        type: 'object',
        properties: {
          nombre: { type: 'string', minLength: 1, maxLength: 100, example: 'Gerente General' },
          descripcion: { type: 'string', nullable: true, example: 'Responsable de la gestión general' },
          nivel_jerarquico: { type: 'integer', nullable: true, example: 1 },
          salario_base: { type: 'number', format: 'decimal', nullable: true, example: 5000.00 },
        },
      },
    },
  },
}))
