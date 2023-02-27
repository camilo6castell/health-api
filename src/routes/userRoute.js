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

const userSchema = require("../models/userSchema");

/* CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 1. REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  const { idUser, name, address, dob, email, phone } = req.body;
  const isUser = await userSchema.find({ idUser: idUser }).exec();
  if (isUser.length == 0) {
    const token = makeTC(5);
    const verified = { activated: false, token: token };
    const password = bcrypt.hashSync(req.body.password, salt);
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
      from: '"Email sender" <emailvalidator@registrosusericos.com',
      to: `${email}`,
      subject: "Validation email",
      html: `<p>Buenos días ${name}, recientemete te has registrado en nuestra aplicación de registros médicos, 
        pero para poder usar nuestros servicios es necesario que verifiques tu dirección de email. Para verificarla
        deberás hacer click en el siguiente enlace. Gracias por usar nuestros servicios!</p>
  
        <p><a href="http://localhost:7654/api/user/verify/${idUser}/${token}"> <button>¡Click acá para validar el email!</button></a></p>
        
        <p>Cordialmente,</p>`,
    });
    res.json({
      statusCode: 200,
      status: `Usuario creado, por favor verifique su email. El email de prueba ha sido enviado, este correo electrónico no llegará a su correo para evitar problemas de seguridad y/o de filtros de spam. Por favor siga el siguiente enlace para validar el email. El enlace l@ llevará a una página pensada para testear correos electrónicos como este. *El token generado tiene una duración de 60 minutos de validez, después de este tiempo no se podrá utilizar*`,
      enlace: `${nodemailer.getTestMessageUrl(info)}`,
    });
  } else {
    res.json({
      status: "No se puede crear, el usuario ya existe",
    });
  }
});

/* 2. LOGIN DE USUARIO */

router.post("/login", async (req, res) => {
  const isUser = await userSchema.findOne({ idUser: req.body.idUser });
  console.log(req.body.idUser);
  if (isUser) {
    if (bcrypt.compareSync(req.body.password, isUser.password)) {
      if (isUser.verified.activated == false) {
        res.json({
          statusCode: 404,
          status:
            "Recuerda que debes verificar tu email primero antes de comenzar a usar nuestros servicios",
        });
      } else {
        res.json({
          statusCode: 200,
          status: "¡Médico logeado!",
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
      status: "El usuario no existe",
    });
  }
});

/* 3. VERIFICACION DE EMAIL EN EL SERVIDOR */

router.get("/verify/:idUser/:token", async (req, res) => {
  const idUser = req.params.idUser;
  const isToken = req.params.token;
  const user = await userSchema.findOne({ idUser: idUser });
  if (isToken == user.verified.token) {
    user.verified.activated = true;
    await user.save();
    res.json({
      statusCode: 200,
      status: "Su cuenta de usuario ha sido verificada",
    });
  } else {
    res.json({
      statusCode: 404,
      status:
        "La verificación ha fallado, por favor revise el link de verificación",
    });
  }
});

/* 4. CAMBIAR CONTRASEÑA */

router.post("/updatepass", async (req, res) => {
  const idUser = req.body.idUser;
  const password = req.body.password;
  let newPassword = req.body.newPassword;
  const user = await userSchema.findOne({ idUser: idUser });
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      if (bcrypt.compareSync(newPassword, user.password)) {
        res.json({
          statusCode: 200,
          status: "La nueva contraseña tiene que ser diferente a la anterior",
        });
      } else {
        newPassword = bcrypt.hashSync(newPassword, salt);
        user.password = newPassword;
        user.save();
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

/* 5. CONSULTAR HISTORIA CLÍNICA */

router.post("/gethistory", async (req, res) => {
  const idUser = req.body.idUser;
  const user = await userSchema.findOne({ idUser: idUser });
  if (user) {
    res.json(user.medHistory);
  } else {
    res.json({
      satusCode: 404,
      status: "Usuario no encontrado",
    });
  }
});

module.exports = router;
