# 🔧 Solución de Problemas - Backend ProdSC

## Error: "Functions cannot be passed directly to Client Components"

### Solución implementada:

1. **Se modificó `src/lib/openapi.ts`:**
   - Se agregó `JSON.parse(JSON.stringify(...))` para serializar el objeto
   - Esto elimina cualquier función o referencia circular

2. **Se modificó `src/app/api/reference/route.ts`:**
   - Se agregó `export const dynamic = 'force-static'`
   - Se usa `NextResponse.json()` en lugar de `Response.json()`

3. **Se creó `src/app/docs/layout.tsx`:**
   - Agrega metadata correcta para SEO

### Para verificar que funciona:

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Limpiar cache de Next.js
rm -rf .next

# 3. Reiniciar el servidor
npm run dev

# 4. Abrir en navegador
http://localhost:3000/docs
```

### Si el error persiste:

**Opción A: Verificar la instalación de Scalar**
```bash
npm list @scalar/nextjs-api-reference
# Debería mostrar: @scalar/nextjs-api-reference@0.8.23
```

**Opción B: Reinstalar dependencias**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Opción C: Verificar versión de Next.js**
```bash
npm list next
# Debería ser: next@15.5.6
```

---

## Error: EADDRINUSE (Puerto en uso)

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Error: Prisma Client no generado

```bash
npx prisma generate
```

---

## Error: DATABASE_URL no definida

1. Verificar que existe `.env`:
```bash
ls -la .env
```

2. Verificar contenido:
```bash
cat .env | grep DATABASE_URL
```

3. Si no existe, copiar desde ejemplo:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

---

## Error: JWT_SECRET no definida

Agregar al `.env`:
```env
JWT_SECRET="tu_clave_secreta_minimo_32_caracteres_aqui"
```

---

## Error al conectar a la base de datos

1. **Verificar que PostgreSQL esté corriendo:**
```bash
# Linux
sudo systemctl status postgresql

# Mac
brew services list | grep postgresql

# Windows
# Abrir Services.msc y buscar PostgreSQL
```

2. **Verificar credenciales en .env:**
```env
DATABASE_URL="postgresql://usuario:password@host:5432/database?schema=schema_name"
```

3. **Probar conexión:**
```bash
npx prisma db pull
```

---

## Error: Module not found '@/...'

Verificar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Documentación Scalar no carga

1. **Verificar que el endpoint funcione:**
```bash
curl http://localhost:3000/api/reference
# Debe devolver JSON con la spec
```

2. **Verificar middleware:**
   - Asegurarse que `/docs` y `/api/reference` estén en rutas públicas

3. **Ver consola del navegador:**
   - Abrir DevTools (F12)
   - Ver errores en Console y Network

---

## Error de autenticación en endpoints

1. **Verificar que estás logueado:**
```bash
# Hacer login primero
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' \
  -c cookies.txt
```

2. **Usar la cookie en requests:**
```bash
curl http://localhost:3000/api/cargos -b cookies.txt
```

---

## Error: ZodError en validación

El error indica que los datos enviados no cumplen el schema.

**Ejemplo de error:**
```json
{
  "success": false,
  "error": "Datos de entrada inválidos"
}
```

**Solución:**
1. Ver la documentación en `/docs` para el formato correcto
2. Verificar tipos de datos (string, number, etc.)
3. Verificar campos requeridos

---

## Build falla en producción

```bash
# Limpiar y reconstruir
rm -rf .next
npm run build

# Si hay errores de TypeScript, verificar:
npx tsc --noEmit
```

---

## Error: Cannot find module 'prisma'

```bash
npm install prisma @prisma/client
npx prisma generate
```

---

## Logs útiles para debugging

### En desarrollo:
```javascript
// En cualquier route.ts
console.log('Request body:', await request.json())
console.log('Headers:', request.headers)
console.log('Cookies:', request.cookies.getAll())
```

### Verificar variables de entorno:
```javascript
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
```

---

## Reiniciar completamente el proyecto

```bash
# 1. Detener el servidor
# Ctrl+C

# 2. Limpiar todo
rm -rf node_modules package-lock.json .next

# 3. Reinstalar
npm install

# 4. Regenerar Prisma
npx prisma generate

# 5. Iniciar
npm run dev
```

---

## Contacto para Soporte

Si el problema persiste:
1. Verificar todos los pasos anteriores
2. Revisar logs completos en la terminal
3. Tomar screenshot del error
4. Contactar al equipo de desarrollo

---

**Última actualización:** 2025-10-21
