const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

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
const medHistorySchema = require("../models/medHistorySchema");

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
      html: `<p>Buen día! El hospital ${name} recientemete ha sido registrado en nuestra aplicación de registros médicos, 
        pero para poder usar nuestros servicios es necesario que verifiques tu dirección de email. Para verificarla
        deberás hacer click en el siguiente enlace. Gracias por usar nuestros servicios!</p>
  
        <p><a href="http://localhost:7654/api/hospital/verify/${idHos}/${token}"> <button>¡Click acá para validar el email!</button></a></p>
        
        <p>Cordialmente,</p>`,
    });
    res.json({
      statusCode: 200,
      status: `Hospital creado. El email de prueba ha sido enviado, este correo electrónico no llegará a su correo para evitar problemas de seguridad y/o de filtros de spam. Por favor siga el siguiente enlace para validar el email. El enlace l@ llevará a una página pensada para testear correos electrónicos como este. *El token generado tiene una duración de 60 minutos de validez, después de este tiempo no se podrá utilizar*`,
      enlace: `${nodemailer.getTestMessageUrl(info)}`,
    });
  } else {
    res.json({
      status: "No se puede crear, el hospital ya existe",
    });
  }
});

/* 2. LOGIN DE HOSPITAL */

router.post("/login", async (req, res) => {
  const isHos = await hosSchema.findOne({ idHos: req.body.idHos }).exec();
  if (isHos) {
    if (bcrypt.compareSync(req.body.password, isHos.password)) {
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
  const hos = await hosSchema.findOne({ idHos: idHos });
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

/* 4. CAMBIO DE CONTRASEÑA */

router.post("/updatepass", async (req, res) => {
  const idHos = req.body.idHos;
  const password = req.body.password;
  let newPassword = req.body.newPassword;
  const hos = await hosSchema.findOne({ idHos: idHos });
  if (hos) {
    if (bcrypt.compareSync(password, hos.password)) {
      if (bcrypt.compareSync(newPassword, hos.password)) {
        res.json({
          statusCode: 200,
          status: "La nueva contraseña tiene que ser diferente a la anterior",
        });
      } else {
        newPassword = bcrypt.hashSync(newPassword, salt);
        hos.password = newPassword;
        hos.save();
        res.json({
          statusCode: 200,
          status: "Contraseña cambiada con éxito",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        status: "Credenciales inválidas",
      });
    }
  } else {
    res.json({
      statusCode: 404,
      status: "Credenciales inválidas",
    });
  }
});

/* 5. CONSULTAR HISTORIAS CLINICAS CON MISMO HOSPITAL */

router.post("/gethistory", async (req, res) => {
  const idHos = req.body.idHos;
  const medHistory = await medHistorySchema.find({ idHos: idHos });
  res.json(medHistory);
});

module.exports = router;
