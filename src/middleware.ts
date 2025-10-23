import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/reference', '/api/docs']
const PUBLIC_PATHS = ['/docs'] // Rutas de páginas públicas

// Configuración de CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

function corsHeaders(origin: string | null) {
  const headers = new Headers()

  // Verificar si el origen está permitido
  const isAllowed =
    ALLOWED_ORIGINS.includes('*') || // Permitir todos los orígenes
    (origin && ALLOWED_ORIGINS.includes(origin)) || // Origen específico en la lista
    (origin && origin.startsWith('http://localhost:')) // Cualquier localhost en desarrollo

  if (isAllowed && origin) {
    headers.set('Access-Control-Allow-Origin', origin)
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Allow-Credentials', 'true')

  return headers
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Manejar preflight requests (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    })
  }

  // Permitir acceso a rutas públicas
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_PATHS.includes(pathname)) {
    const response = NextResponse.next()
    const cors = corsHeaders(origin)
    cors.forEach((value, key) => response.headers.set(key, value))
    return response
  }

  // Verificar si es una ruta de API
  if (pathname.startsWith('/api')) {
    const token = request.cookies.get('token')?.value

    // Si no hay token, denegar acceso
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado - Token no proporcionado' },
        { status: 401 }
      )
    }

    // Verificar el token (ahora es async)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'No autorizado - Token inválido o expirado' },
        { status: 401 }
      )
    }

    // Token válido, permitir acceso
    const response = NextResponse.next()

    // Agregar CORS headers
    const cors = corsHeaders(origin)
    cors.forEach((value, key) => response.headers.set(key, value))

    // Agregar información del usuario a los headers para uso en las rutas
    response.headers.set('x-user-id', decoded.id_usuario.toString())
    response.headers.set('x-user-uuid', decoded.uuid)
    response.headers.set('x-user-personal-id', decoded.id_personal.toString())
    response.headers.set('x-username', decoded.username)

    return response
  }

  const response = NextResponse.next()
  const cors = corsHeaders(origin)
  cors.forEach((value, key) => response.headers.set(key, value))
  return response
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
