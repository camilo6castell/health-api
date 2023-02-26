const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

/* VERIFICACION DE EMAIL */

const nodemailer = require("nodemailer");

function makeTC(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/* Encriptación de password */

const salt = bcrypt.genSaltSync(5);

/* require("dotenv").config(); */

const hosSchema = require("../models/hosSchema");

/* CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 1. CREACIÓN REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  const password = bcrypt.hashSync(req.body.password, salt);
  const { idHos, name, address, services, email, phone } = req.body;
  const token = makeTC(5);
  const verified = { activated: false, token: token };
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
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    let info = await transporter.sendMail({
      from: '"Email sender" <emailvalidator@registrosmedicos.com',
      to: `${email}`,
      subject: "Validation email",
      html: `<p>Buenos días. El hospital ${name} recientemete ha sido registrado en nuestra aplicación de registros médicos, 
        pero para poder usar nuestros servicios es necesario que verifiques tu dirección de email. Para verificarla
        deberás hacer click en el siguiente enlace. Gracias por usar nuestros servicios!</p>
  
        <p><a href="http://localhost:7654/api/medico/verify/${idHos}/${token}"> <button>¡Click acá para validar el email!</button></a></p>
        
        <p>Cordialmente,</p>`,
    });
    res.json({
      statusCode: 200,
      status: "¡Hospital guardado!",
    });
  } else {
    res.json({
      status: "No se puede crear, el hospital ya existe",
    });
  }
});

/* 2. LOGIN DE HOSPITAL */

router.post("/login", async (req, res) => {
  const isHos = await hosSchema.findOne({ idHos: req.body.idHos });
  if (isHos) {
    if (bcrypt.compareSync(req.body.password, isMed.password)) {
      if (isHos.verified.activated == false) {
        res.json({
          statusCode: 404,
          status:
            "Recuerda que debes verificar tu email primero antes de comenzar a usar nuestros servicios",
        });
      } else {
        res.json({
          statusCode: 200,
          status: "¡Hospital logeado!",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        status: "Verifica tu información y vuelve a intentarlo",
      });
    }
  } else {
    res.json({
      statusCode: 404,
      status: "El hospital no existe en nuestros registros",
    });
  }
});

/* 3. VERIFICACION DE EMAIL EN EL SERVIDOR */

router.get("/verify/:idHos/:token", async (req, res) => {
  const idHos = req.params.idHos;
  const isToken = req.params.token;
  const hos = await medSchema.findOne({ idHos: idHos });
  if (isToken == hos.verified.token) {
    hos.verified.activated = true;
    await hos.save();
    res.json({
      statusCode: 200,
      status: "Su cuenta de hospital ha sido verificada",
    });
  } else {
    res.json({
      statusCode: 404,
      status:
        "La verificación ha fallado, por favor revise el link de verificación",
    });
  }
});

module.exports = router;
