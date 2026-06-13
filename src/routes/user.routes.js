const express = require('express')
const router = express.Router()
const { register, login, getProfile } = require('../controllers/user.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

/* Rutas públicas*/
router.post('/register', register)
router.post('/login', login)

/* Rutas protegidas*/
router.get('/profile', verifyToken, getProfile)

module.exports = router