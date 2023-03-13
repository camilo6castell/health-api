# API para sistema de gestión de historia clínica centralizada

## About

Api realizada para gestionar hospitales, médicos y usuarios de un sistema de historia clínica centralizada.

Esta API se desarrollo en Node.js con ayuda de express.js. y para el manejo de base de datos se utilizó mongoDB. Además del software ya mencionado, se usaron Mongoose, bcrypt, dotenv, morgan, nodemail y nodemon. Gracias a ellas pude realizar este trabajo.

Como carácterística de esta API resalto que se hicieron validaciones en la entrada de datos y su respectivo manejo de errores. Adicionalmente se tuvo en cuenta la seguridad y privacidad en el manejo de los datos de cada actor del sistema.

## Pasos en la realización de este proyecto

Para la realización de esta API se siguieron los siguientes pasos:

1. Creación de proyecto con npm init.
2. Instalación de Express.js junto con dependencias necesarias para el funcionamiento de la API y para desarrollo de la misma (mongoose, dotev, morgan, nodemon).
3. Configuración de variables de entorno en .env y hacerlas accesibles en archivos .js.
4. Planeación a lapiz y papel de la base datos con base en los requerimientos.
5. Realización de modelos (schemas) para base de datos en MongoDB.
6. Creación de rutas y lógica de programación para cada funcionalidad requerida.
7. Realización de validación con forme se hacen funcionalidades.
8. Registro de usuarios con respectivas condiciones.
9. Encriptación de contraseñas y creación de token de validación de email.
10. Creación de lógica para envío de email de validación de usuarios.
11. Creación de funcionalidades especiales para los diferentes actores con ayuda de datos de prueba (adjuntos más adelante).
12. Correción en schemas para responder de manera precisa a peticiones.
13. Agregar posibilidad de descargar archivo con información requerida.
14. Creación y correción de README.MD.
15. Despliegue del servicio web (API REST) en servicio web gratuito en linea.

## Consideraciones

Para el correcto funcionamiento de esta API se deben acatar la siguientes condiciones del sistema:

1. Se aconseja usar alguna herramienta de API para hacer peticiones (ThunderClient, Postman, etc).
2. Se deben enviar las peticiones en formato .JSON (el formato que se mostrará más adelante en la sección de "Modo de uso").
3. Se debe usar el método específico en cada petición como se muestra en la sección "Modo de uso" más abajo es tes archivo.
4. Todos las llaves que componen el .JSON para cada petición son obligatorios.
5. Para el correcto funcionamiento del servicio web (API REST), se deben tener en cuenta reglas exigidas por el proyecto. Estas reglas son por ejemplo: Un usuario no podrá acceder a la plataforma si no confirma su email, debe existir un usuario hospital antes de crear un usuario médico para poder vincularlos, el usuario médico deberá cambiar la contraseña la primera vez que inicio sesión, etc.

## Modo de uso con datos [opcionales] de prueba

### User

Crear usuario

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/user/register

Local:
  POST http://localhost:5000/api/user/register

{
  "idUser": "usuario80",
  "password": "123",
  "name": "123",
  "address": "123",
  "dob": "123",
  "email": "123@gmail.com",
  "phone": "123"
}
```

Validar usuario correo

> _Al momento de enviar la petición POST, el servidor devolverá el enlace para ir a la plataforma de validación de correo electrónico._

Login usuario

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/user/login
Local:
  POST http://localhost:5000/api/user/login

{
  "idUser": "usario3",
  "password": "123"
}
```

Cambiar password usuario

```javascript
Deploy:
  PATCH https://health-api-wuip.onrender.com/api/user/updatepass
Local:
  PATCH http://localhost:5000/api/user/updatepass

{
  "idUser": "usuario3",
  "password": "123",
  "newPassword": "1234"
}
```

Conseguir historia clínica de usuario

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/user/gethistory
Local:
  POST http://localhost:5000/api/user/gethistory

{
  "idUser": "usuario3"
}
```

Descargar observaciones médicas de usuario

```javascript
Deploy:
  GET https://health-api-wuip.onrender.com/api/user/download
Local:
  GET http://localhost:5000/api/user/download

{
  "idUser": "usuario3"
}
```

### Medico

Crear medico

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/medico/register
Local:
  POST http://localhost:5000/api/medico/register

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

> _Al momento de enviar la petición POST, el servidor devolverá el enlace para ir a la plataforma de validación de correo electrónico._

Login médico

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/medico/login
Local:
  POST http://localhost:5000/api/medico/login

{
  "idMed": "medico1",
  "password": "1234"
}
```

Cambiar password médico

```javascript
Deploy:
  PATCH https://health-api-wuip.onrender.com/api/hospital/updatepass
Local:
  PATCH http://localhost:5000/api/hospital/updatepass

{
  "idMed": "medico",
  "password": "123",
  "newPassword": "1234"
}
```

Agregar a historia clínica

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/medico/addhistory
Local:
  POST http://localhost:5000/api/medico/addhistory

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

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/medico/gethistory
Local:
  POST http://localhost:5000/api/medico/gethistory

{
  "idMed": "medico3"
}
```

### Hospital

Crear cuenta de hospital

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/hospital/register
Local:
  POST http://localhost:5000/api/hospital/register

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

Validar usuario hospital

> _Al momento de enviar la petición POST, el servidor devolverá el enlace para ir a la plataforma de validación de correo electrónico._

Login hospital

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/hospital/login
Local:
  POST http://localhost:5000/api/hospital/login

{
  "idHos": "hospital3",
  "password": "123"
}
```

Cambiar password hospital

```javascript
Deploy:
  PATCH https://health-api-wuip.onrender.com/api/hospital/updatepass
Local:
  PATCH http://localhost:5000/api/hospital/updatepass

{
  "idHos": "hospital3",
  "password": "123",
  "newPassword": "1234"
}
```

Conseguir todas las historias clinicas de los médicos del mismo hospital

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/hospital/gethistory
Local:
  POST http://localhost:5000/api/hospital/gethistory

{
  "idHos": "hospital3"
}
```

### Contact

[GitHub](https://github.com/camilo6castell?tab=repositories)

[LinkedIn](https://www.linkedin.com/in/camilocastell/)
