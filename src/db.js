const mongoose = require("mongoose");

/* Acceso a variables de entorno */
const dotenv = require("dotenv");
dotenv.config();

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.DB_KEY)
  .then(() => console.log("***Base datos conectada con éxito***"))
  .catch((error) => console.log(error));

module.exports = mongoose;
