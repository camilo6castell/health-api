const express = require("express");
const router = express.Router();

/* require("dotenv").config(); */

const hosSchema = require("../models/hosSchema");

/* CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 1. CREACIÓN REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  const { idHos, password, name, address, services, verified, email, phone } =
    req.body;
  const isHos = await hosSchema.find({ idHos: idHos }).exec();
  if (isHos.length == 0) {
    const newHos = new hosSchema({
      idHos,
      password,
      name,
      address,
      services,
      verified,
      email,
      phone,
    });
    await newHos.save();
    res.json({
      statusCode: 200,
      status: "¡Hospital guardado!",
    });
  } else {
    res.json({
      status: "El hospital ya existe",
    });
  }
});

module.exports = router;
