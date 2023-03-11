const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

/* 1. IMPORTACIÓN DE SCHEMAS PARA MONGODB */

const userSchema = require("../models/userSchema");
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

/* 4.1. REGISTRO DE USUARIOS */

router.post("/register", async (req, res) => {
  if (
    req.body.idUser &&
    req.body.name &&
    req.body.address &&
    req.body.dob &&
    req.body.mail &&
    req.body.phone
  ) {
    const { idUser, name, address, dob, email, phone } = req.body;
    try {
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
        res.status(200).json({
          message: `Usuario creado, por favor verifique su email. El email de prueba ha sido enviado, este correo electrónico no llegará a su correo para evitar problemas de seguridad y/o de filtros de spam. Por favor siga el siguiente enlace para validar el email. El enlace l@ llevará a una página pensada para testear correos electrónicos como este. *El token generado tiene una duración de 60 minutos de validez, después de este tiempo no se podrá utilizar*`,
          enlace: `${nodemailer.getTestMessageUrl(info)}`,
        });
      } else {
        res.status(409).json({
          message: "No se puede crear, el usuario ya existe",
        });
      }
    } catch (error) {
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

/* 4.2. LOGIN DE USUARIO */

router.post("/login", async (req, res) => {
  if (req.body.idUser && req.body.password) {
    try {
      const isUser = await userSchema
        .findOne({ idUser: req.body.idUser })
        .exec();
      if (isUser) {
        if (bcrypt.compareSync(req.body.password, isUser.password)) {
          if (isUser.verified.activated == false) {
            res.status(403).json({
              message:
                "Recuerda que debes verificar tu email primero antes de comenzar a usar nuestros servicios",
            });
          } else {
            res.status(200).json({
              status: "¡Médico logeado!",
            });
          }
        } else {
          res.status(401).json({
            message: "Verifica tu información y vuelve a intentarlo",
          });
        }
      } else {
        res.status(404).json({
          message: "El usuario no existe",
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

router.get("/verify/:idUser/:token", async (req, res) => {
  if (req.params.idUser && req.params.token) {
    const idUser = req.params.idUser;
    const isToken = req.params.token;
    try {
      const user = await userSchema.findOne({ idUser: idUser });
      if (isToken == user.verified.token) {
        user.verified.activated = true;
        await user.save();
        res.status(200).json({
          message: `Su cuenta de hospital ${idUser} ha sido verificada con éxito ¡ahora puedes iniciar sesión!`,
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

/* 4.4. CAMBIAR CONTRASEÑA */

router.post("/updatepass", async (req, res) => {
  if (req.body.idUser && req.body.password && req.body.newPassword) {
    const idUser = req.body.idUser;
    const password = req.body.password;
    let newPassword = req.body.newPassword;
    try {
      const user = await userSchema.findOne({ idUser: idUser });
      if (user) {
        if (bcrypt.compareSync(password, user.password)) {
          if (bcrypt.compareSync(newPassword, user.password)) {
            res.status(401).json({
              message:
                "La nueva contraseña tiene que ser diferente a la anterior",
            });
          } else {
            newPassword = bcrypt.hashSync(newPassword, salt);
            user.password = newPassword;
            user.save();
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

/* 4.5. CONSULTAR HISTORIA CLÍNICA */

router.post("/gethistory", async (req, res) => {
  if (req.body.idUser) {
    const idUser = req.body.idUser;
    try {
      const user = await medHistorySchema.find({ idUser: idUser }).exec();
      console.log(user);
      if (user.length != 0) {
        res.status(200).json(user);
      } else {
        res.status(404).json({
          message: "No hay historias clínicas del usuario consultado",
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

/* 4.6. DESCARGA DE TODAS LAS OBSERVACIONES HECHAS A UN PACIENTE */

router.get("/download", async (req, res) => {
  if (req.body.idUser) {
    const idUser = req.body.idUser;
    try {
      const user = await medHistorySchema.find({ idUser: idUser });
      if (user.length != 0) {
        var writeStream = fs.createWriteStream(
          path.join("src", "public", "observaciones.txt")
        );
        for (let i = 0; i < user.length; i++) {
          const element = user[i];
          if (i == 0) {
            var line = `Observaciones para el paciente ${element.idUser}:\n\nDoctor ${element.idMed}: ${element.observations}\n`;
            writeStream.write(line);
          } else {
            var line = `Doctor ${element.idMed}: ${element.observations}\n`;
            writeStream.write(line);
          }
        }
        writeStream.end();
        res
          .status(200)
          .download(path.join("src", "public", "observaciones.txt"));
      } else {
        res.status(404).json({
          message: "No hay registros para el usuario consultado",
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
