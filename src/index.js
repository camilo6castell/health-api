const express = require("express");
const morgan = require("morgan");
const path = require("node:path");

/* Importar base de datos */

const { mongoose } = require("./db");

/* Acceso a variables de entorno */

require("dotenv").config();

/* Configuración servidor */

const app = express();
const port = process.env.PORT || 5000;

/* middlewares */

app.use(express.json());
app.use(morgan("dev"));

/* Gestión de archivos estáticos */

app.use(express.static(path.join(__dirname, "public")));

//rutas

app.use("/api/user", require("./routes/userRoute"));
app.use("/api/hospital", require("./routes/hosRoute"));
app.use("/api/medico", require("./routes/medRoute"));

/* Inicialización del servidor */

app.listen(port, () => {
  console.log(`Conectado a http://localhost:${port}`);
});
