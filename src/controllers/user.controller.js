const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

/* Registrar usuario*/
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        /* Verifica si el usuario ya existe*/
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(400).json({ 
                message: 'El email ya está registrado' 
            })
        }

        /* Encripta la contraseña*/
        const hashedPassword = await bcrypt.hash(password, 10)

        /* Crea el usuario en la base de datos */
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

/* Login de usuario*/
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        /* Busca el usuario*/
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(400).json({ 
                message: 'Credenciales incorrectas' 
            })
        }

        /* Verifica la contraseña*/
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({ 
                message: 'Credenciales incorrectas' 
            })
        }

        /* Genera el token JWT */
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}
/* Obtener perfil*/
const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })

        res.json({ user })

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
}

module.exports = { register, login, getProfile }