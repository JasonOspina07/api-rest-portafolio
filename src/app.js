const express = require('express')
const cors = require('cors')

const app = express()

/* Middlewares globales */
app.use(cors())
app.use(express.json())

/* Rutas */
const userRoutes = require('./routes/user.routes')
app.use('/api/users', userRoutes)

/* Ruta de prueba */
app.get('/', (req, res) => {
    res.json({
        message: '¡API funcionando correctamente!',
        version: '1.0.0'
    })
})

module.exports = app