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
      url: 'https://backend-prodsc.vercel.app',
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
    {
      name: 'Temporadas',
      description: 'Configuración de temporadas y multiplicadores de precios',
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
    '/api/personal': {
      get: {
        tags: ['Personal'],
        summary: 'Listar personal',
        description: 'Obtiene una lista paginada de personal con filtros opcionales',
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
            description: 'Búsqueda en nombre, apellido, CI y email',
          },
          {
            name: 'estado',
            in: 'query',
            schema: { type: 'string', enum: ['Activo', 'Inactivo'] },
            description: 'Filtrar por estado',
          },
          {
            name: 'id_cargo',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filtrar por cargo',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', default: 'nombre', enum: ['nombre', 'apellido', 'ci', 'fecha_contratacion'] },
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
            description: 'Lista de personal',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Personal' },
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
        tags: ['Personal'],
        summary: 'Crear personal',
        description: 'Crea un nuevo empleado en el sistema',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePersonal' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Personal creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Personal creado exitosamente' },
                    data: { $ref: '#/components/schemas/Personal' },
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
          '404': {
            description: 'El cargo especificado no existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'El CI o email ya existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/personal/{id}': {
      get: {
        tags: ['Personal'],
        summary: 'Obtener personal por ID',
        description: 'Obtiene los detalles de un empleado específico',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del personal',
          },
        ],
        responses: {
          '200': {
            description: 'Detalles del personal',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/PersonalDetallado' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Personal no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Personal'],
        summary: 'Actualizar personal',
        description: 'Actualiza los datos de un empleado existente',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del personal',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePersonal' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Personal actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Personal actualizado exitosamente' },
                    data: { $ref: '#/components/schemas/Personal' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Personal no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'El CI o email ya existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Personal'],
        summary: 'Eliminar personal',
        description: 'Elimina un empleado del sistema (solo si no tiene relaciones activas)',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del personal',
          },
        ],
        responses: {
          '200': {
            description: 'Personal eliminado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Personal eliminado exitosamente' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Personal no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'No se puede eliminar porque tiene registros relacionados o usuario asociado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/admin/temporada/calendario': {
      get: {
        tags: ['Temporadas'],
        summary: 'Obtener calendario de temporadas',
        description: 'Obtiene el calendario completo de un año con las temporadas asignadas a cada mes y sus multiplicadores',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'anio',
            in: 'query',
            description: 'Año del calendario (por defecto: año actual)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 2000,
              maximum: 2100,
              example: 2025,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Calendario obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        anio: { type: 'integer', example: 2025 },
                        meses: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/MesCalendario' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Año inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
    },
    '/api/admin/temporada/tipos': {
      get: {
        tags: ['Temporadas'],
        summary: 'Obtener tipos de temporada',
        description: 'Obtiene todos los tipos de temporada disponibles con sus multiplicadores activos',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Tipos de temporada obtenidos exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        temporadas: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/TemporadaTipo' },
                        },
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
    },
    '/api/admin/temporada/mes': {
      put: {
        tags: ['Temporadas'],
        summary: 'Actualizar temporada de un mes',
        description: 'Actualiza o crea la configuración de temporada para un mes específico',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMesTemporada' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Temporada actualizada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Temporada actualizada correctamente' },
                    data: { $ref: '#/components/schemas/MesTemporadaActualizado' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Datos de entrada inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
          '404': {
            description: 'Temporada no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/admin/temporada/meses/lote': {
      put: {
        tags: ['Temporadas'],
        summary: 'Actualizar múltiples meses en lote',
        description: 'Actualiza la temporada de varios meses en una sola operación transaccional',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMesesLote' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Meses actualizados exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: '3 meses actualizados correctamente' },
                    data: {
                      type: 'object',
                      properties: {
                        actualizados: { type: 'integer', example: 3 },
                        meses: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              mes: { type: 'integer', example: 3 },
                              id_temporada: { type: 'integer', example: 2 },
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
          '400': {
            description: 'Datos de entrada inválidos o meses duplicados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
          '404': {
            description: 'Una o más temporadas no existen',
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
      Personal: {
        type: 'object',
        properties: {
          id_personal: { type: 'integer', example: 1 },
          ci: { type: 'string', example: '12345678' },
          nombre: { type: 'string', example: 'Juan' },
          apellido: { type: 'string', example: 'Pérez' },
          email: { type: 'string', nullable: true, example: 'juan.perez@example.com' },
          telefono: { type: 'string', nullable: true, example: '77123456' },
          direccion: { type: 'string', nullable: true, example: 'Av. Siempre Viva 123' },
          id_cargo: { type: 'integer', example: 1 },
          fecha_contratacion: { type: 'string', format: 'date', example: '2025-01-15' },
          estado: { type: 'string', example: 'Activo' },
          cargo: {
            type: 'object',
            properties: {
              id_cargo: { type: 'integer', example: 1 },
              nombre: { type: 'string', example: 'Gerente' },
              nivel_jerarquico: { type: 'integer', nullable: true, example: 2 },
            },
          },
          usuario: {
            type: 'object',
            nullable: true,
            properties: {
              id_usuario: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'jperez' },
              uuid: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            },
          },
          _count: {
            type: 'object',
            properties: {
              alquiler: { type: 'integer', example: 10 },
              venta: { type: 'integer', example: 5 },
              produccion: { type: 'integer', example: 3 },
              estructuramodular: { type: 'integer', example: 2 },
            },
          },
        },
      },
      PersonalDetallado: {
        allOf: [
          { $ref: '#/components/schemas/Personal' },
          {
            type: 'object',
            properties: {
              cargo: {
                type: 'object',
                properties: {
                  id_cargo: { type: 'integer', example: 1 },
                  nombre: { type: 'string', example: 'Gerente' },
                  descripcion: { type: 'string', nullable: true, example: 'Gerente de área' },
                  nivel_jerarquico: { type: 'integer', nullable: true, example: 2 },
                  salario_base: { type: 'number', format: 'decimal', nullable: true, example: 5000.00 },
                },
              },
              usuario: {
                type: 'object',
                nullable: true,
                properties: {
                  id_usuario: { type: 'integer', example: 1 },
                  username: { type: 'string', example: 'jperez' },
                  uuid: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                  ultimo_acceso: { type: 'string', format: 'date-time', nullable: true, example: '2025-01-20T10:30:00Z' },
                  bloqueado: { type: 'boolean', example: false },
                },
              },
              _count: {
                type: 'object',
                properties: {
                  alquiler: { type: 'integer', example: 10 },
                  venta: { type: 'integer', example: 5 },
                  produccion: { type: 'integer', example: 3 },
                  estructuramodular: { type: 'integer', example: 2 },
                  mantenimiento: { type: 'integer', example: 8 },
                  produccionpersonal: { type: 'integer', example: 15 },
                },
              },
            },
          },
        ],
      },
      CreatePersonal: {
        type: 'object',
        required: ['ci', 'nombre', 'apellido', 'id_cargo', 'fecha_contratacion'],
        properties: {
          ci: { type: 'string', maxLength: 20, example: '12345678' },
          nombre: { type: 'string', maxLength: 100, example: 'Juan' },
          apellido: { type: 'string', maxLength: 100, example: 'Pérez' },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true, example: 'juan.perez@example.com' },
          telefono: { type: 'string', maxLength: 20, nullable: true, example: '77123456' },
          direccion: { type: 'string', nullable: true, example: 'Av. Siempre Viva 123' },
          id_cargo: { type: 'integer', example: 1 },
          fecha_contratacion: { type: 'string', format: 'date', example: '2025-01-15' },
          estado: { type: 'string', enum: ['Activo', 'Inactivo'], nullable: true, example: 'Activo' },
        },
      },
      UpdatePersonal: {
        type: 'object',
        properties: {
          ci: { type: 'string', maxLength: 20, example: '12345678' },
          nombre: { type: 'string', maxLength: 100, example: 'Juan' },
          apellido: { type: 'string', maxLength: 100, example: 'Pérez' },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true, example: 'juan.perez@example.com' },
          telefono: { type: 'string', maxLength: 20, nullable: true, example: '77123456' },
          direccion: { type: 'string', nullable: true, example: 'Av. Siempre Viva 123' },
          id_cargo: { type: 'integer', example: 1 },
          fecha_contratacion: { type: 'string', format: 'date', example: '2025-01-15' },
          estado: { type: 'string', enum: ['Activo', 'Inactivo'], nullable: true, example: 'Activo' },
        },
      },
      MesCalendario: {
        type: 'object',
        properties: {
          mes: { type: 'integer', minimum: 1, maximum: 12, example: 1, description: 'Número del mes (1-12)' },
          nombre: { type: 'string', example: 'Enero', description: 'Nombre del mes en español' },
          id_temporada: { type: 'integer', nullable: true, example: 1, description: 'ID de la temporada asignada' },
          temporada_nombre: { type: 'string', nullable: true, example: 'Alta', description: 'Nombre de la temporada' },
          color_hex: { type: 'string', nullable: true, example: '#FF5252', description: 'Color en hexadecimal para UI' },
          multiplicadores: {
            type: 'object',
            properties: {
              alquiler: { type: 'number', format: 'float', example: 1.10, description: 'Multiplicador para alquileres' },
              venta: { type: 'number', format: 'float', example: 1.10, description: 'Multiplicador para ventas' },
            },
            required: ['alquiler', 'venta'],
          },
        },
        required: ['mes', 'nombre', 'multiplicadores'],
      },
      TemporadaTipo: {
        type: 'object',
        properties: {
          id_temporada: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Alta' },
          descripcion: { type: 'string', nullable: true, example: 'Diciembre-Febrero (bodas, fiestas patronales)' },
          color_hex: { type: 'string', nullable: true, example: '#FF5252' },
          multiplicadores: {
            type: 'object',
            properties: {
              alquiler: { type: 'number', format: 'float', example: 1.10 },
              venta: { type: 'number', format: 'float', example: 1.10 },
            },
            required: ['alquiler', 'venta'],
          },
        },
        required: ['id_temporada', 'nombre', 'multiplicadores'],
      },
      UpdateMesTemporada: {
        type: 'object',
        properties: {
          anio: { type: 'integer', minimum: 2000, maximum: 2100, example: 2025, description: 'Año de la configuración' },
          mes: { type: 'integer', minimum: 1, maximum: 12, example: 3, description: 'Número del mes (1-12)' },
          id_temporada: { type: 'integer', example: 2, description: 'ID de la temporada a asignar' },
        },
        required: ['anio', 'mes', 'id_temporada'],
      },
      MesTemporadaActualizado: {
        type: 'object',
        properties: {
          mes: { type: 'integer', example: 3 },
          nombre_mes: { type: 'string', example: 'Marzo' },
          anio: { type: 'integer', example: 2025 },
          id_temporada: { type: 'integer', example: 2 },
          temporada_nombre: { type: 'string', example: 'Media' },
          color_hex: { type: 'string', nullable: true, example: '#FFA726' },
          multiplicadores: {
            type: 'object',
            properties: {
              alquiler: { type: 'number', format: 'float', example: 1.00 },
              venta: { type: 'number', format: 'float', example: 1.00 },
            },
          },
        },
      },
      UpdateMesesLote: {
        type: 'object',
        properties: {
          anio: { type: 'integer', minimum: 2000, maximum: 2100, example: 2025 },
          actualizaciones: {
            type: 'array',
            minItems: 1,
            maxItems: 12,
            items: {
              type: 'object',
              properties: {
                mes: { type: 'integer', minimum: 1, maximum: 12, example: 3 },
                id_temporada: { type: 'integer', example: 2 },
              },
              required: ['mes', 'id_temporada'],
            },
            example: [
              { mes: 3, id_temporada: 2 },
              { mes: 4, id_temporada: 2 },
              { mes: 5, id_temporada: 2 },
            ],
          },
        },
        required: ['anio', 'actualizaciones'],
      },
    },
  },
}))
