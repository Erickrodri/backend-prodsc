import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/reference', '/api/docs']
const PUBLIC_PATHS = ['/docs'] // Rutas de páginas públicas

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas públicas
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
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

    // Verificar el token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'No autorizado - Token inválido o expirado' },
        { status: 401 }
      )
    }

    // Token válido, permitir acceso
    const response = NextResponse.next()

    // Agregar información del usuario a los headers para uso en las rutas
    response.headers.set('x-user-id', decoded.id_usuario.toString())
    response.headers.set('x-user-uuid', decoded.uuid)
    response.headers.set('x-user-personal-id', decoded.id_personal.toString())
    response.headers.set('x-username', decoded.username)

    return response
  }

  return NextResponse.next()
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
