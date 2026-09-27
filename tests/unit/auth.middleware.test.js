const jwt = require('jsonwebtoken')
const { verifyToken } = require('../../src/middlewares/auth.middleware')

/* Necesitamos un JWT_SECRET para poder firmar tokens de prueba*/
process.env.JWT_SECRET = 'secreto_de_pruebas'

describe('Middleware: verifyToken', () => {

  /* Creamos "req", "res" y "next" falsos (mocks) para cada test.*/
  /* No levantamos un servidor real, solo simulamos los objetos que Express le pasaría al middleware. */
  let req, res, next

  beforeEach(() => {
    req = { headers: {} }
    res = {
      status: jest.fn().mockReturnThis(), /* permite encadenar res.status(401).json(...)*/
      json: jest.fn()
    }
    next = jest.fn()
  })

  test('rechaza la petición si no hay header de Authorization', () => {
    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acceso denegado. Token no proporcionado'
    })
    expect(next).not.toHaveBeenCalled()
  })

  test('rechaza la petición si el header no tiene el formato "Bearer token"', () => {
    req.headers['authorization'] = 'Bearer' // falta el token después del espacio

    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acceso denegado. Formato inválido'
    })
    expect(next).not.toHaveBeenCalled()
  })

  test('rechaza la petición si el token es inválido o expiró', () => {
    req.headers['authorization'] = 'Bearer un.token.invalido'

    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido o expirado'
    })
    expect(next).not.toHaveBeenCalled()
  })

  test('deja pasar la petición y guarda el usuario en req.user si el token es válido', () => {
    const payload = { id: 1, email: 'jason@gmail.com' }
    const tokenValido = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
    req.headers['authorization'] = `Bearer ${tokenValido}`

    verifyToken(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toMatchObject(payload)
    expect(res.status).not.toHaveBeenCalled()
  })
})