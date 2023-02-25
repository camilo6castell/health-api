const express = require("express");
const router = express.Router();

/* require("dotenv").config(); */

const userSchema = require("../models/userSchema");

/* CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 1. CREACIÓN REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  const { idUser, password, name, address, dob, verified, email, phone } =
    req.body;
  const isUser = await userSchema.find({ idUser: idUser }).exec();
  if (isUser.length == 0) {
    const newUser = new userSchema({
      idUser,
      password,
      name,
      address,
      dob,
      verified,
      email,
      phone,
    });
    await newUser.save();
    res.json({
      statusCode: 200,
      status: "¡Usuario guardado!",
    });
  } else {
    res.json({
      status: "No se puede crear, el usuario ya existe",
    });
  }
});

module.exports = router;
