import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

// Convertir el secret a Uint8Array para jose
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  id_usuario: number
  uuid: string
  id_personal: number
  username: string
}

/**
 * Genera un token JWT usando jose (compatible con Edge Runtime)
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(getSecretKey())

    return token
  } catch (error) {
    console.error('Error generando token:', error)
    throw error
  }
}

/**
 * Verifica y decodifica un token JWT usando jose (compatible con Edge Runtime)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())

    // Validar que el payload tiene las propiedades requeridas
    if (
      typeof payload.id_usuario === 'number' &&
      typeof payload.uuid === 'string' &&
      typeof payload.id_personal === 'number' &&
      typeof payload.username === 'string'
    ) {
      return {
        id_usuario: payload.id_usuario,
        uuid: payload.uuid,
        id_personal: payload.id_personal,
        username: payload.username,
      }
    }

    return null
  } catch (error) {
    console.error('Error verificando token:', error)
    return null
  }
}

/**
 * Hashea una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compara una contraseña con su hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Obtiene el token desde las cookies de la petición
 */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  return token?.value || null
}

/**
 * Obtiene el usuario autenticado desde el token
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies()
  if (!token) return null
  return await verifyToken(token)
}

/**
 * Calcula la fecha de expiración del token
 */
export function getTokenExpirationDate(): Date {
  const hours = parseInt(JWT_EXPIRES_IN.replace('h', '')) || 8
  const expirationDate = new Date()
  expirationDate.setHours(expirationDate.getHours() + hours)
  return expirationDate
}
