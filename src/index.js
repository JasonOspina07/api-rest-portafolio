const dotenv = require('dotenv')

/* Carga las variables de entorno*/
dotenv.config()

const app = require('./app')

/* Inicia el servidor*/
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})