# API para sistema de gestión de historia clínica centralizada

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-AA2929?style=for-the-badge&logo=mongoose&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-339933?style=for-the-badge&logo=security&logoColor=white)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=envato&logoColor=black)
![morgan](https://img.shields.io/badge/morgan-000000?style=for-the-badge&logo=logging&logoColor=white)
![nodemailer](https://img.shields.io/badge/nodemailer-3B7D3C?style=for-the-badge&logo=email&logoColor=white)
![nodemon](https://img.shields.io/badge/nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)

## About

API created to manage hospitals, doctors and users of a centralized medical history system.

This API was developed in Node.js with the help of express.js. and mongoDB is used to manage the database. In addition to the software already mentioned, Mongoose, bcrypt, dotenv, morgan, nodemail and nodemon were used. Thanks to them I was able to do this work.

As a feature of this API, I would like to highlight that validations were made in the data entry and its respective error handling. In addition, I especially consider the security and privacy in the handling of the data of each actor in the system.

## Steps in the realization of this project

The following steps were followed to create this API:

1. Planning the database with pencil and paper based on the requirements.
2. Project creation with npm init.
3. Installation of Express.js along with dependencies necessary for the operation of the API and for its development (mongoose, dotev, morgan, nodemon).
4. Configuration of environment variables in .env and making them accessible in .js files.
5. Creation of models (schemas) for the MongoDB database.
6. Creation of routes and programming logic for each required functionality.
7. Validation as functionalities are created.
8. User registration with respective conditions.
9. Password encryption and creation of email validation token.
10. Creation of logic for sending user validation emails.
11. Creation of special functionalities for the different actors with the help of test data (attached below).
12. Correction of schemas to respond accurately to requests.
13. Add possibility to download file with required information.
14. Creation and correction of README.MD.
15. Deployment of web service (REST API) in free online web service.

## Considerations

For the correct operation of this API, the following system conditions must be met:

1. It is advisable to use some API tool to make requests (ThunderClient, Postman, etc.).
2. Requests must be sent in .JSON format (the format that will be shown later in the "How to use" section).
3. The specific method must be used in each request as shown in the "How to use" section below in this file.
4. All the keys that make up the .JSON for each request are mandatory.
5. For the correct operation of the web service (REST API), rules required by the project must be taken into account. These rules are, for example: a) A user will not be able to access the platform if they do not confirm their email, b) a hospital user must exist before creating a medical user in order to link them, c) the medical user must change the password the first time they log in, etc.

## Usage mode with [optional] test data

### User

Create user

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

Validate user email

> _When sending the POST request, the server will return the link to go to the email validation platform._
> Login usuario

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

Change user password

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

Obtain user medical history

```javascript
Deploy:
  POST https://health-api-wuip.onrender.com/api/user/gethistory
Local:
  POST http://localhost:5000/api/user/gethistory

{
  "idUser": "usuario3"
}
```

Download user medical comments

```javascript
Deploy:
  GET https://health-api-wuip.onrender.com/api/user/download
Local:
  GET http://localhost:5000/api/user/download

{
  "idUser": "usuario3"
}
```

### Doctor

Create doctor

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

Validate medical user

> When sending the POST request, the server will return the link to go to the email validation platform.\_

Medical login

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

Change medical password

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

Add to medical history

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

Obtain all medical records from the same doctor

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

Create hospital account

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

Validate hospital user

> _When sending the POST request, the server will return the link to go to the email validation platform._

Hospital login

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

Change hospital password

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

Obtain all the medical records of the doctors at the same hospital

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
