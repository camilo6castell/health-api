const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

/* 1. IMPORTACIÓN DE SCHEMAs */

const medSchema = require("../models/medSchema");
const hosSchema = require("../models/hosSchema");
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

/* 4.1. REGISTRO DE MEDICOS */

router.post("/register", async (req, res) => {
  if (
    req.body.idMed &&
    req.body.idHos &&
    req.body.name &&
    req.body.address &&
    req.body.dob &&
    req.body.email &&
    req.body.phone
  ) {
    const { idMed, idHos, name, address, dob, email, phone } = req.body;
    try {
      const isHos = await hosSchema.find({ idHos: idHos }).exec();
      const isUser = await medSchema.find({ idMed: idMed }).exec();
      if (isHos) {
        if (isUser.length == 0) {
          const sessionNum = 0;
          const password = bcrypt.hashSync(req.body.password, salt);
          const token = makeTC(5);
          const verified = { activated: false, token: token };
          const newMed = new medSchema({
            idMed,
            idHos,
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
            html: `<p>Buenos días doctor ${name}, recientemete el hospital ${isHos.name} te ha registrado en nuestra aplicación de registros médicos, 
                pero para poder usar nuestros servicios es necesario que verifiques tu dirección de email. Para verificarla
                deberás hacer click en el siguiente enlace. Gracias por usar nuestros servicios!</p>
          
                <p><a href="http://localhost:7654/api/medico/verify/${idMed}/${token}"> <button>¡Click acá para validar el email!</button></a></p>
                
                <p>Cordialmente,</p>`,
          });
          res.status(200).json({
            message: `Médico creado. El email de prueba ha sido enviado, este correo electrónico no llegará a su correo para evitar problemas de seguridad y/o de filtros de spam. Por favor siga el siguiente enlace para validar el email. El enlace l@ llevará a una página pensada para testear correos electrónicos como este. *El token generado tiene una duración de 60 minutos de validez, después de este tiempo no se podrá utilizar*`,
            enlace: `${nodemailer.getTestMessageUrl(info)}`,
          });
        } else {
          res.status(409).json({
            message:
              "No se puede crear, el médico ya existe en la base de datos del Hospital",
          });
        }
      } else {
        res.status(400).json({
          message:
            "Registro no exitoso. No es posible registrar un médico sin un hospital",
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

/* 4.2. LOGIN DE MEDICO */

router.post("/login", async (req, res) => {
  if (req.body.idMed && req.body.password) {
    try {
      const isMed = await medSchema.findOne({ idMed: req.body.idMed }).exec();
      if (isMed) {
        if (bcrypt.compareSync(req.body.password, isMed.password)) {
          if (isMed.verified.activated == false) {
            res.status(401).json({
              message:
                "Recuerda que debes verificar tu email primero antes de comenzar a usar nuestros servicios",
            });
          } else {
            if (isMed.sessionNum == 0) {
              res.status(401).json({
                message:
                  "Señor médico, es requisito para poder iniciar sesión por primera vez que cambies tu contraseña primero",
              });
            } else {
              res.status(200).json({
                message: "¡Médico logeado!",
              });
            }
          }
        } else {
          res.status(401).json({
            message: "Verifica tu información y vuelve a intentarlo",
          });
        }
      } else {
        res.status(404).json({
          message: "El médico no existe",
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

router.get("/verify/:idMed/:token", async (req, res) => {
  if (req.params.idMed && req.params.token) {
    const idMed = req.params.idMed;
    const isToken = req.params.token;
    try {
      const med = await medSchema.findOne({ idMed: idMed });
      if (isToken == med.verified.token) {
        med.verified.activated = true;
        await med.save();
        res.status(200).json({
          message: "Su cuenta de médico ha sido verificada",
        });
      } else {
        res.status(404).json({
          message:
            "La verificación ha fallado, por favor revise el link de verificación",
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
  if (req.body.idMed && req.body.password && req.body.newPassword) {
    const idMed = req.body.idMed;
    const password = req.body.password;
    let newPassword = req.body.newPassword;
    try {
      const med = await medSchema.findOne({ idMed: idMed }).exec();
      if (med) {
        if (bcrypt.compareSync(password, med.password)) {
          if (bcrypt.compareSync(newPassword, med.password)) {
            res.status(401).json({
              message:
                "La nueva contraseña tiene que ser diferente a la anterior",
            });
          } else {
            newPassword = bcrypt.hashSync(newPassword, salt);
            med.password = newPassword;
            med.sessionNum = 1;
            med.save();
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

/* 4.5. AGREGAR HISTORIAS CLÍNICAS */

router.post("/addhistory", async (req, res) => {
  if (
    req.body.idUser &&
    req.body.idMed &&
    req.body.idHos &&
    eq.body.speciality &&
    req.body.healthCondition &&
    req.body.observations
  ) {
    const { idUser, idMed, idHos, speciality, healthCondition, observations } =
      req.body;
    try {
      const user = await userSchema.findOne({ idUser: idUser });
      const med = await userSchema.findOne({ idMed: idMed });
      const hos = await userSchema.findOne({ idHos: idHos });
      if (user && med && hos) {
        const newMedHistory = new medHistorySchema({
          idUser,
          idMed,
          idHos,
          speciality,
          healthCondition,
          observations,
        });
        newMedHistory.save();
        res.status(200).json({
          message: `La historia médica para ${idUser} realizada por el doctor ${idMed} en el hospital ${idHos} ha sido guardada`,
        });
      } else {
        res.status(404).json({
          message:
            "Datos de verificación son incorrectos o inexistentes. Se recomienda revisarlos y volverlo a intentar",
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

/* 4.6. CONSULTAR HISTORIAS CLINICAS CON MISMO DOCTOR */

router.post("/gethistory", async (req, res) => {
  if (req.body.idMed) {
    const idMed = req.body.idMed;
    try {
      const medHistory = await medHistorySchema.find({ idMed: idMed }).exec();
      if (medHistory.length != 0) {
        res.status(200).json(medHistory);
      } else {
        res.status(404).json({
          message: `No existen historias clínicas hechas por el doctor ${idMed} para ningún paciente`,
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

module.exports = router;
