const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

/* 1. IMPORTACIÓN DE SCHEMAS PARA MONGODB */

const hosSchema = require("../models/hosSchema");
const medHistorySchema = require("../models/medHistorySchema");

/* 2. VERIFICACION DE EMAIL */

const nodemailer = require("nodemailer");

/* 2.1. CREACIÓN DE CÓDIGO ÚNICO PARA VERIFICACIÓN DE EMAIL */

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

/* 3. PASO PREVIO PARA ENCRIPTAR PASSWORD */

const salt = bcrypt.genSaltSync(5);

/* 4. CREACIÓN DE RUTAS POR FUNCIONALIDAD */

/* 4.1. CREACIÓN REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  if (
    req.body.idHos &&
    req.body.password &&
    req.body.name &&
    req.body.address &&
    req.body.services &&
    req.body.email &&
    req.body.phone
  ) {
    const password = bcrypt.hashSync(req.body.password, salt);
    const { idHos, name, address, services, email, phone } = req.body;
    const token = makeTC(5);
    const verified = { activated: false, token: token };

    try {
      const isHos = await hosSchema.find({ idHos: idHos });
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
        try {
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
          res.status(201).json({
            message: `Hospital creado. El email de prueba ha sido enviado, este correo electrónico no llegará a su correo para evitar problemas de seguridad y/o de filtros de spam. Por favor siga el siguiente enlace para validar el email. El enlace l@ llevará a una página pensada para testear correos electrónicos como este. *El token generado tiene una duración de 60 minutos de validez, después de este tiempo no se podrá utilizar*`,
            enlace: `${nodemailer.getTestMessageUrl(info)}`,
          });
        } catch (error) {
          res.status(500).json({
            message: `Ha surgido un error al comunicarse con nuestro sistema de base de datos. Por favor verifique el formato sugerido en el archivo README.md para la información que nos está intentando enviar. (El error fue: ${error})`,
          });
        }
      } else {
        res.status(409).json({
          message: "No se puede crear, el hospital ya existe",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(404).json({
        message: `Ha surgido un error al comunicarse con nuestro sistema de base de datos. Por favor verifique el formato sugerido en el archivo README.md para la información que nos está intentando enviar. (El error fue: ${error})`,
      });
    }
  } else {
    res.status(400).json({
      message: `Datos o formato incorrecto, por favor revisar archivo README.md para saber datos y formato requerido para esta petición al servidor`,
    });
  }
});

/* 4.2. LOGIN DE HOSPITAL */

router.post("/login", async (req, res) => {
  if (req.body.idHos && req.body.password) {
    try {
      const isHos = await hosSchema.findOne({ idHos: req.body.idHos }).exec();
      if (isHos) {
        if (bcrypt.compareSync(req.body.password, isHos.password)) {
          if (isHos.verified.activated == false) {
            res.status(403).json({
              message:
                "Recuerda que debes verificar tu email primero antes de comenzar a usar nuestros servicios",
            });
          } else {
            res.status(200).json({
              message: "¡Hospital logeado!",
            });
          }
        } else {
          res.status(401).json({
            message: "Verifica tu información y vuelve a intentarlo",
          });
        }
      } else {
        res.status(404).json({
          message: "El hospital no existe en nuestros registros",
        });
      }
    } catch (error) {
      res.status(400).json({
        message: `Ha surgido un error al comunicarse con nuestro sistema de base de datos. Por favor verifique el formato sugerido en el archivo README.md para la información que nos está intentando enviar. (El error fue: ${error})`,
      });
    }
  } else {
    res.status(400).json({
      message: `Datos o formato incorrecto, por favor revisar archivo README.md para saber datos y formato requerido para esta petición al servidor`,
    });
  }
});

/* 4.3. VERIFICACION DE EMAIL EN EL SERVIDOR */

router.get("/verify/:idHos/:token", async (req, res) => {
  if (req.params.idHos && req.params.token) {
    const idHos = req.params.idHos;
    const isToken = req.params.token;
    try {
      const hos = await hosSchema.findOne({ idHos: idHos }).exec();
      if (isToken == hos.verified.token) {
        hos.verified.activated = true;
        await hos.save();
        res.status(200).json({
          message: `Su cuenta de hospital ${idHos} ha sido verificada con éxito ¡ahora puedes iniciar sesión!`,
        });
      } else {
        res.status(404).json({
          message: `La verificación ha fallado, por favor revise el link de verificación, si ya no tiene acceso a él, será necesario crear un nuevo registro y asegurarse de usar el link de verificación de manera exacta`,
        });
      }
    } catch (error) {
      res.status(404).json({
        message: `Ha surgido un error al comunicarse con nuestro sistema de base de datos. Por favor verifique el link enviado en el registro, si ya no tiene acceso a él, será necesario crear un nuevo registro y asegurarse de usar el link de verificación de manera exacta (El error fue: ${error})`,
      });
    }
  } else {
    res.status(400).json({
      message:
        "Link inválido: Por favor verifique el link enviado en el registro, si ya no tiene acceso a él, será necesario crear un nuevo registro y asegurarse de usar el link de verificación de manera exacta",
    });
  }
});

/* 4.4. CAMBIO DE CONTRASEÑA */

router.patch("/updatepass", async (req, res) => {
  if (req.body.idHos && req.body.password) {
    const idHos = req.body.idHos;
    const password = req.body.password;
    let newPassword = req.body.newPassword;
    try {
      const hos = await hosSchema.findOne({ idHos: idHos }).exec();
      if (hos) {
        if (bcrypt.compareSync(password, hos.password)) {
          if (bcrypt.compareSync(newPassword, hos.password)) {
            res.status(401).json({
              message:
                "La nueva contraseña tiene que ser diferente a la anterior",
            });
          } else {
            newPassword = bcrypt.hashSync(newPassword, salt);
            hos.password = newPassword;
            hos.save();
            res.status(200).json({
              message: "Contraseña cambiada con éxito",
            });
          }
        } else {
          res.status(401).json({
            message: "Credenciales inválidas",
          });
        }
      } else {
        res.status(401).json({
          message: "Credenciales inválidas",
        });
      }
    } catch (error) {
      res.status(400).json({
        message: `Ha surgido un error al comunicarse con nuestro sistema de base de datos. Por favor verifique el formato sugerido en el archivo README.md para la información que nos está intentando enviar. (El error fue: ${error})`,
      });
    }
  } else {
    res.status(400).json({
      message:
        "Datos incompletos o incorrectos, por favor revisar el formato descrito en el archivo README.md",
    });
  }
});

/* 4.5. CONSULTAR HISTORIAS CLINICAS CON MISMO HOSPITAL */

router.post("/gethistory", async (req, res) => {
  if (req.body.idHos) {
    const idHos = req.body.idHos;
    try {
      const medHistory = await medHistorySchema.find({ idHos: idHos }).exec();
      if (medHistory.length != 0) {
        res.status(200).json(medHistory);
      } else {
        res.status(404).json({
          message: "No hay historias clínicas para el hospital consultado",
        });
      }
    } catch (error) {
      res.status(400).json({
        message: `Ha surgido un error al comunicarse con nuestro sistema de base de datos. Por favor verifique el formato sugerido en el archivo README.md para la información que nos está intentando enviar. (El error fue: ${error})`,
      });
    }
  } else {
    res.status(400).json({
      message:
        "Datos incompletos o incorrectos, por favor revisar el formato descrito en el archivo README.md para poder consultar historia clínica del hospital",
    });
  }
});

module.exports = router;
