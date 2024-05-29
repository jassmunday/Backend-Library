# MyNodeBackendLibrary

MyNodeBackendLibrary is a robust backend library for Node.js applications using Express.js. This library encompasses crucial aspects of backend development such as error handling, response handling, file handling with Cloudinary, MongoDB connection, Mongoose models, middlewares, JWT-based authorization, password hashing with bcrypt, and user management functionalities including login, logout, update, delete, and file uploads with Multer and Cloudinary.

## Features

- **Error Handling**: Comprehensive error handling middleware.
- **Response Handling**: Standardized response structure.
- **File Handling**: Integration with Cloudinary for file uploads.
- **Database**: MongoDB connection setup and Mongoose models.
- **Middlewares**: Essential middlewares including authorization.
- **Authentication**: JWT-based authentication and password hashing with bcrypt.
- **User Management**: User login, logout, update, delete functionalities.
- **File Upload**: Multer for handling file uploads.

## Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/MyNodeBackendLibrary.git
cd MyNodeBackendLibrary
npm install
```

## Configuration

Create a `.env` file in the root directory of your project and add the following environment variables:

```env
MONGO_URI=
PORT=

JWT_SECRET_TOKEN =
TOKEN_EXPIRY=
REFRESH_SECRET_TOKEN=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_API=
```

## Usage

### Starting the Server

To start the server, run:

```bash
npm start
```

### Directory Structure

```
MyNodeBackendLibrary/
├── controllers/
│   └── userController.js
├── middlewares/
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/
│   └── User.js
├── routes/
│   └── userRoutes.js
├── utils/
│   ├── db.js
│   └── responseHandler.js
├── uploads/
├── .env
├── app.js
├── package.json
└── Readme.md
```

### Examples

#### MongoDB Connection (`utils/db.js`)

```js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### User Model (`models/User.js`)

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
```

#### User Controller (`controllers/userController.js`)

```js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleResponse, handleError } = require('../utils/responseHandler');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.register = async (req, res) => {
  // Registration logic
};

exports.login = async (req, res) => {
  // Login logic
};

exports.logout = (req, res) => {
  // Logout logic
};

exports.updateUser = async (req, res) => {
  // Update user logic
};

exports.deleteUser = async (req, res) => {
  // Delete user logic
};

exports.uploadFile = async (req, res) => {
  // File upload logic
};
```

#### Middleware Example (`middlewares/authMiddleware.js`)

```js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
```

#### Error Handling Middleware (`middlewares/errorHandler.js`)

```js
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
```

#### Response Handling Utility (`utils/responseHandler.js`)

```js
exports.handleResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json({ data, message });
};

exports.handleError = (res, statusCode, message) => {
  res.status(statusCode).json({ message });
};
```

#### Cloudinary Utility (`utils/cloudinary.js`)

```js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudinary = async (filePath) => {
  return await cloudinary.uploader.upload(filePath);
};
```

### Routes (`routes/userRoutes.js`)

```js
const express = require('express');
const { register, login, logout, updateUser, deleteUser, uploadFile } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.put('/update', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUser);
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);

module.exports = router;
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For any questions or inquiries, please contact me at [jassnangal15@gmail.com].
