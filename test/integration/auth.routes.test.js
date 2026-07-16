const request = require('supertest')

process.env.JWT_SECRET = 'secreto_de_pruebas'

/* Mockeamos el módulo de Prisma ANTES de importar la app.*/
/* Así, cuando el controller haga `prisma.user.findUnique(...)`,*/
/*en realidad está llamando a nuestra función falsa (jest.fn()),*/
/* no a la base de datos real.*/
jest.mock('../../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}))

const prisma = require('../../src/config/prisma')
const app = require('../../src/app')

describe('POST /api/users/register', () => {

  beforeEach(() => {
    /* Limpia el historial de llamadas de los mocks antes de cada test,
     * para que uno no afecte al siguiente.
     */
    jest.clearAllMocks()
  })

  test('registra un usuario nuevo correctamente', async () => {
    /* Simulamos que el email NO existe todavía en la base de datos*/
    prisma.user.findUnique.mockResolvedValue(null)

    /* Simulamos lo que Prisma "devolvería" al crear el usuario */
    prisma.user.create.mockResolvedValue({
      id: 1,
      name: 'Jason',
      email: 'jason@gmail.com',
      password: 'hash_falso' /* no importa, el controller no la devuelve al cliente */
    })

    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Jason', email: 'jason@gmail.com', password: '123456' })

    expect(res.status).toBe(201)
    expect(res.body.message).toBe('Usuario registrado exitosamente')
    expect(res.body.user).toEqual({
      id: 1,
      name: 'Jason',
      email: 'jason@gmail.com'
    })
    /* Verificamos que la contraseña jamás se devuelve en la respuesta */
    expect(res.body.user.password).toBeUndefined()
  })

  test('rechaza el registro si el email ya existe', async () => {
    /* Simulamos que Prisma SÍ encuentra un usuario con ese email */
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'jason@gmail.com'
    })

    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Jason', email: 'jason@gmail.com', password: '123456' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('El email ya está registrado')
    /* Nunca debería intentar crear el usuario si ya existe */
    expect(prisma.user.create).not.toHaveBeenCalled()
  })
})

describe('POST /api/users/login', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('rechaza el login si el email no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'noexiste@gmail.com', password: '123456' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Credenciales incorrectas')
  })

  test('rechaza el login si la contraseña es incorrecta', async () => {
    const bcrypt = require('bcryptjs')
    const hashReal = await bcrypt.hash('claveCorrecta', 10)

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Jason',
      email: 'jason@gmail.com',
      password: hashReal
    })

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'jason@gmail.com', password: 'claveIncorrecta' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Credenciales incorrectas')
  })

  test('devuelve un token cuando el login es exitoso', async () => {
    const bcrypt = require('bcryptjs')
    const hashReal = await bcrypt.hash('123456', 10)

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Jason',
      email: 'jason@gmail.com',
      password: hashReal
    })

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'jason@gmail.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Login exitoso')
    expect(res.body.token).toBeDefined()
    expect(typeof res.body.token).toBe('string')
  })
})