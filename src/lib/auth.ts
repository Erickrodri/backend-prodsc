import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || ''
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '8h'

export interface JWTPayload {
  id_usuario: number
  uuid: string
  id_personal: number
  username: string
}

/**
 * Genera un token JWT
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as string })
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
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
  return verifyToken(token)
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
