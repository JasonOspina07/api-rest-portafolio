const request = require('supertest')
const app = require('../../src/app')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

jest.setTimeout(15000)

describe('Auth endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  }

  afterAll(async () => {
    /* Limpieza: borra el usuario de test y cierra la conexión*/
    await prisma.user.deleteMany({ where: { email: testUser.email } })
    await prisma.$disconnect()
  })

  describe('POST /api/users/register', () => {
    it('debe rechazar un registro sin campos obligatorios con 400', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Sin Datos' })

      expect(res.statusCode).toBe(400)
    })

    it('debe rechazar una contraseña muy corta con 400', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Corta', email: 'corta@example.com', password: '123' })

      expect(res.statusCode).toBe(400)
    })

    it('debe registrar un usuario nuevo y devolver 201', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser)

      expect(res.statusCode).toBe(201)
      expect(res.body.user).toHaveProperty('id')
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user).not.toHaveProperty('password') // nunca debe salir el hash
    })

    it('debe rechazar un email duplicado con 400', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser)

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toMatch(/ya está registrado/i)
    })
  })

  describe('POST /api/users/login', () => {
    it('debe rechazar login sin campos obligatorios con 400', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email })

      expect(res.statusCode).toBe(400)
    })

    it('debe hacer login con credenciales correctas y devolver un token', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.email).toBe(testUser.email)
    })

    it('debe rechazar login con password incorrecta con 401', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: 'wrongpassword' })

      expect(res.statusCode).toBe(401)
    })

    it('debe rechazar login con email inexistente con 401', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'noexiste@example.com', password: 'cualquiera' })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/users/profile (ruta protegida)', () => {
    it('debe rechazar el acceso sin token con 401', async () => {
      const res = await request(app).get('/api/users/profile')
      expect(res.statusCode).toBe(401)
    })

    it('debe rechazar un token mal formado con 401', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'TokenMalFormado')

      expect(res.statusCode).toBe(401)
    })

    it('debe rechazar un token inválido con 401', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer token.invalido.aqui')

      expect(res.statusCode).toBe(401)
    })

    it('debe permitir el acceso con token válido y devolver el perfil', async () => {
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password })

      const token = loginRes.body.token

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user).not.toHaveProperty('password')
    })
  })
})