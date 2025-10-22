import { PrismaClient } from '../src/generated/prisma/index.js'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n')

  // 1. Verificar que existe el cargo con ID 8
  const cargo = await prisma.cargo.findUnique({
    where: { id_cargo: 8 },
  })

  if (!cargo) {
    console.error('❌ Error: No existe el cargo con ID 8 (Administrador de Sistema)')
    process.exit(1)
  }

  console.log('✅ Cargo encontrado:', cargo.nombre)

  // 2. Crear personal para el administrador
  console.log('\n👤 Creando personal administrador...')

  const personalAdmin = await prisma.personal.upsert({
    where: { ci: '99999999' },
    update: {},
    create: {
      ci: '99999999',
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@produccionessc.com',
      telefono: '70000000',
      direccion: 'Oficina Central',
      id_cargo: 8, // Administrador de Sistema
      fecha_contratacion: new Date(),
      estado: 'Activo',
    },
  })

  console.log('✅ Personal creado:')
  console.log('   ID:', personalAdmin.id_personal)
  console.log('   Nombre:', personalAdmin.nombre, personalAdmin.apellido)
  console.log('   CI:', personalAdmin.ci)
  console.log('   Cargo ID:', personalAdmin.id_cargo)

  // 3. Crear usuario con contraseña hasheada
  console.log('\n🔐 Creando usuario administrador...')

  // Contraseña: admin123 (cumple con mínimo 6 caracteres de Zod)
  const passwordHash = await bcrypt.hash('admin123', 10)

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {
      password_hash: passwordHash, // Actualiza la contraseña si el usuario ya existe
      bloqueado: false,
      intentos_fallidos: 0,
    },
    create: {
      uuid: randomUUID(),
      id_personal: personalAdmin.id_personal,
      username: 'admin', // Cumple con mínimo 3 caracteres de Zod
      password_hash: passwordHash,
      intentos_fallidos: 0,
      bloqueado: false,
    },
  })

  console.log('✅ Usuario creado:')
  console.log('   ID:', usuarioAdmin.id_usuario)
  console.log('   UUID:', usuarioAdmin.uuid)
  console.log('   Username:', usuarioAdmin.username)
  console.log('   ID Personal:', usuarioAdmin.id_personal)

  console.log('\n' + '='.repeat(60))
  console.log('🎉 SEED COMPLETADO EXITOSAMENTE!')
  console.log('='.repeat(60))
  console.log('\n📝 CREDENCIALES DE ACCESO:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('\n🔗 LOGIN URL:')
  console.log('   POST http://localhost:3000/api/auth/login')
  console.log('\n📄 BODY:')
  console.log('   {')
  console.log('     "username": "admin",')
  console.log('     "password": "admin123"')
  console.log('   }')
  console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n')
}

main()
  .catch((e) => {
    console.error('\n❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
