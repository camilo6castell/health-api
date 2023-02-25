const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.DB_KEY)
  .then(() => console.log("***Base datos conectada con éxito***"))
  .catch((error) => console.log(error));

module.exports = mongoose;
