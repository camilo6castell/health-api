const express = require("express");
const router = express.Router();

/* require("dotenv").config(); */

const medSchema = require("../models/medSchema");

/* CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 1. CREACIÓN REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  const sessionNum = 0;
  const { idMed, password, name, address, dob, verified, email, phone } =
    req.body;
  const isMed = await medSchema.find({ idMed: idMed }).exec();
  if (isMed.length == 0) {
    const newMed = new medSchema({
      idMed,
      password,
      name,
      address,
      dob,
      verified,
      email,
      phone,
      sessionNum,
    });
    await newMed.save();
    res.json({
      statusCode: 200,
      status: "¡Médico guardado!",
    });
  } else {
    res.json({
      status: "No se puede crear, el médico ya existe",
    });
  }
});

module.exports = router;
