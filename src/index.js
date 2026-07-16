const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

/* Carga las variables de entorno*/
dotenv.config()

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())

/* Rutas */
const userRoutes = require('./routes/user.routes')
app.use('/api/users', userRoutes)

/*Ruta de prueba*/
app.get('/', (req, res) => {
    res.json({ 
        message: '¡API funcionando correctamente!',
        version: '1.0.0'
    })
})

/* Inicia el servidor*/
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})