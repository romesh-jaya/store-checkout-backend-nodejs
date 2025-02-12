export {};

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
import { Request as JWTRequest } from 'express-jwt';
const checkAuth = require('../../middleware/check-auth');
import express from 'express';
import { UserModel } from '../../database/models/user.model';
import { User } from '../../models/User';
const router = express.Router();

router.post('/signup', (req, res) => {
  bcryptjs.hash(req.body.password, 10).then((hash) => {
    const userInput: User = {
      email: req.body.email,
      password_hash: hash,
      is_admin: false,
    };

    UserModel.create(userInput)
      .then((user) => {
        const token = jwt.sign({ id: user.id }, process.env.HASHSECRET, {
          expiresIn: process.env.TOKENEXPIRATION,
        });
        const refreshToken = jwt.sign({ id: user.id }, process.env.HASHSECRET, {
          expiresIn: process.env.REFRESHTOKENEXPIRATION,
        });
        res.status(201).json({
          message: 'User created!',
          token: token,
          isAdmin: false,
          refreshToken: refreshToken,
        });
      })
      .catch((error) => {
        if (error.name && error.name == 'SequelizeUniqueConstraintError') {
          if (error.errors && error.errors.length > 0) {
            const firstError = error.errors[0];
            if (firstError.path && firstError.path == 'email') {
              return res.status(500).json({
                message: 'Email already exists',
              });
            }
          }
        }

        res.status(500).json({
          message: error.message,
        });
      });
  });
});

router.post('/login', (req, res) => {
  const token = jwt.sign({ id: 1 }, process.env.HASHSECRET, {
    expiresIn: process.env.TOKENEXPIRATION,
  });

  res.status(200).json({
    token: token,
    isAdmin: true,
    //refreshToken: refreshToken,
  });
});

router.get('/me', checkAuth, (req: JWTRequest, res) => {
  res.status(200).json({
    info: req.auth,
  });
});

module.exports = router;
