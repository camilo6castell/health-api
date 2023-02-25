# API para un sistema de gestión de historia clínica centralizada.

## Pasos en la realización de este proyecto

1. Creación de proyecto con npm init
2. Instalación de Express.js junto con dependencias necesarias para el funcionamiento de la API y para desarrollo de la misma (mongoose, dotev, morgan, nodemon)
3. Configuración de variables de entorno en .env y hacerlas accesibles en archivos .js
4. Planeación a lapiz y papel de la base datos con base en los requerimientos.
5. Realización de modelos para base de datos en MongoDB
6. Creación de rutas y lógica de programación para cada funcionalidad requerida:
   6.1 Comprobación si el registro ya existe antes de hacerlo
   6.1 registro de usuarios
   6.2 encriptación de contraseñas todo

   El usuario no podrá acceder al sistema hasta que confirme su registro.

## Para usar

My application deployed is in the link shown below

[Vercel](https://instaya-frontend-beige.vercel.app/)

## A tener en cuenta

1. El tiempo de espera para poder usar la base de datos en MongoDB es de alredero 30seg a 1min, enviar peticiones antes de este tiempo puede para el servidor.
2. Se deben enviar las peticiones en formato .JSON
3. Todos los datos que componen en .JSON son obligatorios, de no hacerlo o de errar en el formato podría hacer que el servidor se pare.

[Google Drive](cambhttps://drive.google.com/file/d/1y6WoCVnUTGplz7t54d1APP1JbgbVqISF/view?usp=share_linkiar)

### Contact

[LinkedIn](https://www.linkedin.com/in/camilocastell/)
