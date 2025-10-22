# 📚 Guía de Uso - Documentación API con Scalar

## 🌐 Acceso a la Documentación

Una vez que el servidor esté corriendo (`npm run dev`), accede a:

```
http://localhost:3000/docs
```

## 🎨 Interfaz de Scalar

La documentación interactiva de Scalar te proporciona:

### **1. Panel Izquierdo - Navegación**
- 📋 Lista de todos los endpoints organizados por tags
- 🏷️ Tags: Autenticación, Cargos, Personal, etc.
- 🔍 Búsqueda rápida de endpoints

### **2. Panel Central - Detalles**
- 📖 Descripción completa del endpoint
- 📥 Parámetros de entrada (query, path, body)
- 📤 Respuestas posibles con códigos HTTP
- 💡 Ejemplos de request y response
- 📊 Schemas de datos detallados

### **3. Panel Derecho - Playground**
- 🧪 Cliente HTTP interactivo
- 🔐 Configuración de autenticación
- ▶️ Botón "Send" para ejecutar requests
- 📋 Ejemplos de código en múltiples lenguajes

## 🔐 Cómo Autenticarte en Scalar

### Opción 1: Autenticación Manual (Recomendada)

**Paso 1: Hacer login desde Scalar**

1. Ve al endpoint `POST /api/auth/login`
2. En el panel derecho, ingresa las credenciales:
   ```json
   {
     "username": "admin",
     "password": "123456"
   }
   ```
3. Click en **"Send"**
4. Si es exitoso, la cookie se guardará automáticamente

**Paso 2: Usar endpoints protegidos**

Ahora puedes usar cualquier endpoint protegido. La cookie `token` se enviará automáticamente.

### Opción 2: Usar Postman/Thunder Client

Si prefieres usar herramientas externas:

1. Hacer login en Postman
2. Copiar el token de la respuesta
3. En Scalar, ir a "Authentication" y pegar el token

## 🧪 Probar Endpoints

### Ejemplo: Listar Cargos

1. **Ir al endpoint:** `GET /api/cargos`

2. **Ver parámetros disponibles:**
   - `page` (número de página)
   - `limit` (registros por página)
   - `search` (búsqueda)
   - `sortBy` (campo de ordenamiento)
   - `sortOrder` (asc/desc)

3. **Configurar parámetros:**
   ```
   page: 1
   limit: 10
   search: admin
   sortBy: nombre
   sortOrder: asc
   ```

4. **Click en "Send"**

5. **Ver respuesta:**
   ```json
   {
     "success": true,
     "data": [...],
     "pagination": {
       "total": 50,
       "page": 1,
       "limit": 10,
       "totalPages": 5
     }
   }
   ```

### Ejemplo: Crear Cargo

1. **Ir al endpoint:** `POST /api/cargos`

2. **Ver el schema requerido** en la documentación

3. **Ingresar datos en el body:**
   ```json
   {
     "nombre": "Supervisor",
     "descripcion": "Supervisor de producción",
     "nivel_jerarquico": 3,
     "salario_base": 3500.00
   }
   ```

4. **Click en "Send"**

5. **Ver respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "id_cargo": 5,
       "nombre": "Supervisor",
       ...
     },
     "message": "Cargo creado exitosamente"
   }
   ```

## 📋 Generar Código desde Scalar

Scalar puede generar código para ti en múltiples lenguajes:

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/cargos', {
  method: 'GET',
  credentials: 'include', // Importante: incluye cookies
})
const data = await response.json()
```

### cURL
```bash
curl -X GET 'http://localhost:3000/api/cargos?page=1&limit=10' \
  -H 'Cookie: token=eyJhbGciOiJIUzI1NiIs...'
```

### Python
```python
import requests

response = requests.get(
    'http://localhost:3000/api/cargos',
    cookies={'token': 'eyJhbGciOiJIUzI1NiIs...'}
)
data = response.json()
```

## 🔧 Agregar Nuevos Endpoints a la Documentación

Cuando crees nuevos endpoints, actualiza `src/lib/openapi.ts`:

### 1. Agregar el endpoint en `paths`

```typescript
'/api/mi-nuevo-endpoint': {
  get: {
    tags: ['MiTag'],
    summary: 'Resumen corto',
    description: 'Descripción detallada',
    security: [{ cookieAuth: [] }], // Si requiere auth
    parameters: [
      {
        name: 'id',
        in: 'query',
        schema: { type: 'integer' },
        description: 'ID del recurso'
      }
    ],
    responses: {
      '200': {
        description: 'Exitoso',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MiSchema' }
          }
        }
      }
    }
  }
}
```

### 2. Agregar schemas en `components.schemas`

```typescript
MiSchema: {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    nombre: { type: 'string', example: 'Ejemplo' }
  }
}
```

### 3. Recargar `/docs`

Los cambios se reflejarán automáticamente en la documentación.

## 💡 Tips y Mejores Prácticas

### ✅ DO's (Hacer)
- ✅ Actualiza la documentación cuando agregues endpoints
- ✅ Usa ejemplos realistas en los schemas
- ✅ Documenta todos los códigos de error posibles
- ✅ Agrupa endpoints relacionados con tags
- ✅ Incluye descripciones claras y útiles

### ❌ DON'Ts (No hacer)
- ❌ No dejes endpoints sin documentar
- ❌ No uses ejemplos genéricos como "string", "number"
- ❌ No olvides documentar parámetros opcionales
- ❌ No dejes schemas incompletos

## 🚀 Ventajas de usar Scalar vs Postman

| Característica | Scalar | Postman |
|----------------|--------|---------|
| **Documentación automática** | ✅ Sí | ❌ Manual |
| **Integrado en el proyecto** | ✅ Sí | ❌ Externo |
| **Actualización automática** | ✅ Sí | ❌ Manual |
| **Compartir con el equipo** | ✅ URL pública | ⚠️ Requiere cuenta |
| **Pruebas en navegador** | ✅ Sí | ❌ Requiere app |
| **Exportar colecciones** | ✅ OpenAPI | ✅ Postman format |
| **Autenticación integrada** | ✅ Cookies | ✅ Tokens |
| **Testing automatizado** | ❌ No | ✅ Sí |
| **Variables de entorno** | ⚠️ Limitado | ✅ Completo |

## 📊 Schemas Principales Documentados

### Autenticación
- `LoginRequest`
- `AuthResponse`
- `ErrorResponse`

### Cargos
- `Cargo` - Modelo básico
- `CargoDetallado` - Con relaciones
- `CreateCargo` - Para crear
- `UpdateCargo` - Para actualizar

### Respuestas Genéricas
- `ApiResponse<T>` - Respuesta estándar
- `PaginatedResponse<T>` - Con paginación
- `ErrorResponse` - Errores

## 🔄 Flujo de Trabajo Recomendado

### Durante Desarrollo:
1. 📝 Escribe el endpoint en Next.js
2. 📋 Documenta en `openapi.ts`
3. 🧪 Prueba en Scalar (`/docs`)
4. ✅ Verifica con Postman (opcional)

### Para el Equipo Frontend:
1. 🌐 Comparte la URL `/docs`
2. 📖 Revisan la documentación
3. 📋 Copian ejemplos de código
4. 🚀 Integran en su aplicación

---

## 📞 Soporte

Si tienes problemas con la documentación:
1. Verifica que el servidor esté corriendo
2. Revisa la consola del navegador
3. Valida el schema OpenAPI en: https://editor.swagger.io/
4. Consulta la documentación de Scalar: https://github.com/scalar/scalar

---

**Última actualización:** 2025-10-21
