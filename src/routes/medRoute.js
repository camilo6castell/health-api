const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

require("dotenv").config();

/* Encriptación de password */

const salt = bcrypt.genSaltSync(5);

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

/* IMPORTACIÓN DE SCHEMA */

const medSchema = require("../models/medSchema");

/* CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 1. REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  const { idMed, name, address, dob, email, phone } = req.body;
  const isUser = await medSchema.find({ idMed: idMed }).exec();
  if (isUser.length == 0) {
    const sessionNum = 0;
    const password = bcrypt.hashSync(req.body.password, salt);
    const token = makeTC(5);
    const verified = { activated: false, token: token };
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
      html: `<p>Buenos días doctor ${name}, recientemete te has registrado en nuestra aplicación de registros médicos, 
        pero para poder usar nuestros servicios es necesario que verifiques tu dirección de email. Para verificarla
        deberás hacer click en el siguiente enlace. Gracias por usar nuestros servicios!</p>
  
        <p><a href="http://localhost:7654/api/medico/verify/${idMed}/${token}"> <button>¡Click acá para validar el email!</button></a></p>
        
        <p>Cordialmente,</p>`,
    });
    res.json({
      statusCode: 200,
      status: `El email de prueba ha sido enviado, este correo electrónico no llegará a su correo para evitar problemas de seguridad y/o de filtros de spam. Por favor siga el siguiente enlace para validar el email. El enlace l@ llevará a una página pensada para testear correos electrónicos como este. *El token generado tiene una duración de 60 minutos de validez, después de este tiempo no se podrá utilizar*`,
      enlace: `${nodemailer.getTestMessageUrl(info)}`,
    });
  } else {
    res.json({
      status: "No se puede crear, el médico ya existe",
    });
  }
});

/* 2. LOGIN DE MEDICO */

router.post("/login", async (req, res) => {
  const isUser = await medSchema.findOne({ idMed: req.body.idMed });
  console.log(req.body.idMed);
  if (isUser) {
    if (bcrypt.compareSync(req.body.password, isUser.password)) {
      if (isUser.verified.activated == false) {
        res.json({
          statusCode: 404,
          status:
            "Recuerda que debes verificar tu email primero antes de comenzar a usar nuestros servicios",
        });
      } else {
        if (isUser.sessionNum == 0) {
          res.json({
            statusCode: 404,
            status:
              "Señor médico, es requisito para poder iniciar sesión por primera vez que cambies tu contraseña primero",
          });
        } else {
          res.json({
            statusCode: 200,
            status: "¡Médico logeado!",
          });
        }
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
      status: "El usuario no existe",
    });
  }
});

/* 3. VERIFICACION DE EMAIL EN EL SERVIDOR */

router.get("/verify/:idMed/:token", async (req, res) => {
  const idMed = req.params.idMed;
  const isToken = req.params.token;
  const med = await medSchema.findOne({ idMed: idMed });
  if (isToken == med.verified.token) {
    med.verified.activated = true;
    await med.save();
    res.json({
      statusCode: 200,
      status: "Su cuenta de médico ha sido verificada",
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
