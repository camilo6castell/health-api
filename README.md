# API para sistema de gestión de historia clínica centralizada

## About

Api realizada para gestionar hospitales, médicos y usuarios de un sistema de historia clínica centralizada.

Esta API se desarrollo en Node.js con ayuda de express.js. Para el manejo de base de datos se utilizó mongoDB. Además del software ya mencionado, se usaron Mongoose, bcrypt, dotenv, morgan, nodemail y nodemon. Gracias a ellas pude realizar este trabajo.

Como carácterística de esta API resalto que se hicieron validaciones en la entrada de datos y además se tuvo en cuenta la seguridad en el manejo de la información de cada actor del sistema.

## Pasos en la realización de este proyecto

Para la realización de esta API se siguieson los siguientes pasos:

1. Creación de proyecto con npm init
2. Instalación de Express.js junto con dependencias necesarias para el funcionamiento de la API y para desarrollo de la misma (mongoose, dotev, morgan, nodemon)
3. Configuración de variables de entorno en .env y hacerlas accesibles en archivos .js
4. Planeación a lapiz y papel de la base datos con base en los requerimientos.
5. Realización de modelos para base de datos en MongoDB
6. Creación de rutas y lógica de programación para cada funcionalidad requerida.
7. Comprobación si el registro ya existe antes de hacerlo
8. Registro de usuarios con respectivas condiciones.
9. Encriptación de contraseñas y creación de token de validación de email.
10. Creación de lógica para envío de email de validación de usuarios.
11. Creación de funcionalidades especiales para los diferentes actores con ayuda de datos de prueba (adjuntos más adelante).
12. Correción en schemas para responder de manera precisa a peticiones.
13. Agregar posibilidad de descargar archivo con información
14. Creación y correción de README.MD
15. Despliegue del servicio web (API REST) en servicio web gratuito en linea

## Consideraciones

Para el correcto funcionamiento de esta API se deben acatar la siguientes condiciones del sistema:

1. Se aconseja usar alguna herramienta de API para hacer peticiones (Thunder Cliente, Postman, etc)
2. El tiempo de espera para poder usar la base de datos en MongoDB es de alredero 30seg a 1min. Enviar peticiones antes de este tiempo puede para el servidor.
3. Se deben enviar las peticiones en formato .JSON (en el formato que se mostrará más adelante en la sección de "Modo de uso")
4. Todos los datos que componen en .JSON son obligatorios, de no hacerlo o de errar en el formato podría hacer que el servidor se pare.
5. Para el correcto funcionamiento del servicio web (API REST), se deben tener en cuenta reglas exigidas por el proyecto. Estas reglas son por ejemplo: Un usuario no podrá acceder a la plataforma si no confirma su email, debe existir un usuario hospital antes de crear un usuario médico para poder vincularlos, el usuario médico deberá cambiar la contraseña a primera vez que inicio sesión, etc.

## Modo de uso con datos [opcionales] de prueba

### User

Crear usuario

```sh
POST http://localhost:7654/api/user/register

{
  "idUser": "usario3",
  "password": "123",
  "name": "123",
  "address": "123",
  "dob": "123",
  "email": "123@gmail.com",
  "phone": "123"
}
```

Validar usuario correo

```sh
Al momento de enviar la petición POST, el servidor devolverá el enlace para ir a la plataforma de validación de correo electrónico.
```

Login usuario

```sh
POST http://localhost:7654/api/user/login

{
  "idUser": "usario3",
  "password": "123"
}
```

Cambiar password usuario

```sh
POST http://localhost:7654/api/user/updatepass

{
  "idUser": "usuario3",
  "password": "123",
  "newPassword": "1234"
}
```

Conseguir historia clínica de usuario

```sh
POST http://localhost:7654/api/user/gethistory

{
  "idUser": "usuario3"
}
```

Descargar observaciones médicas de usuario

```sh
GET http://localhost:7654/api/user/download

{
  "idUser": "test3"
}
```

### Medico

Crear medico

```sh
POST http://localhost:7654/api/medico/register

{
  "idMed": "medico1",
  "idHos": "hospital3",
  "password": "123",
  "name": "camilo",
  "address": "123",
  "dob": "123",
  "email": "cacastellanosh@unal.edu.co",
  "phone": "123"
}
```

Validar usuario medico

```sh
Al momento de enviar la petición POST, el servidor devolverá el enlace para ir a la plataforma de validación de correo electrónico.
```

Login médico

```sh
POST http://localhost:7654/api/medico/login

{
  "idMed": "medico1",
  "password": "1234"
}
```

Cambiar password médico

```sh
POST http://localhost:7654/api/hospital/updatepass

{
  "idMed": "medico",
  "password": "123",
  "newPassword": "1234"
}
```

Agregar a historia clínica

```sh
POST http://localhost:7654/api/medico/addhistory

{
  "idUser": "usuario1",
  "idMed": "medico3",
  "idHos": "hospital3",
  "speciality": "cardiología",
  "healthCondition": "bad",
  "observations": "not that bad"
}
```

Conseguir todas las historias clinicas del mismo médico

```sh
POST http://localhost:7654/api/medico/gethistory

{
  "idMed": "medico3"
}
```

### Hospital

Crear cuenta de hospital

```sh
POST http://localhost:7654/api/hospital/register

{
  "idHos": "hospital10",
  "password": "123",
  "name": "123",
  "address": "123",
  "services": ["oftalmología", "cardiología", "pediatría"],
  "email": "123@gmail.com",
  "phone": "123"
}
```

Login usuario

```sh
POST http://localhost:7654/api/hospital/login

{
  "idHos": "hospital3",
  "password": "123"
}
```

Cambiar password hospital

```sh
POST http://localhost:7654/api/hospital/updatepass

{
  "idHos": "hospital3",
  "password": "123",
  "newPassword": "1234"
}
```

Conseguir todas las historias clinicas de los médicos del mismo hospital

```sh
POST http://localhost:7654/api/hospital/gethistory

{
  "idHos": "hospital3"
}
```

### Contact

[GitHub](https://github.com/camilo6castell?tab=repositories)

[LinkedIn](https://www.linkedin.com/in/camilocastell/)
