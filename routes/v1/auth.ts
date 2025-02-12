export {};

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
import { Request as JWTRequest } from 'express-jwt';
const checkAuth = require('../../middleware/check-auth');
import express from 'express';
import { UserModel } from '../../database/models/user.model';
import { User } from '../../models/User';
import { logError } from '../../utils/logger';
const router = express.Router();

router.post('/signup', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(500).json({
      message: 'Missing body params email and password',
    });
  }

  bcryptjs.hash(password, 10).then((hash) => {
    const userInput: User = {
      email: email.toLowerCase(),
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

        logError('Error while signing up: ');
        logError(error);

        res.status(500).json({
          message: error.message,
        });
      });
  });
});

router.post('/login', (req, res) => {
  let fetchedUser: User;

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(500).json({
      message: 'Missing body params email and password',
    });
  }

  UserModel.findOne({
    where: {
      email: email.toLowerCase(),
    },
  })
    .then((user) => {
      if (!user) {
        return null;
      }
      fetchedUser = user;
      return bcryptjs.compare(password, user.password_hash);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign({ id: fetchedUser.id }, process.env.HASHSECRET, {
        expiresIn: process.env.TOKENEXPIRATION,
      });
      const refreshToken = jwt.sign(
        { id: fetchedUser.id },
        process.env.HASHSECRET,
        { expiresIn: process.env.REFRESHTOKENEXPIRATION }
      );
      res.status(200).json({
        token: token,
        isAdmin: fetchedUser.is_admin,
        refreshToken: refreshToken,
      });
    })
    .catch((error) => {
      logError('Error while logging in: ');
      logError(error);

      res.status(500).json({
        message: 'Authentication failed: ' + error.message,
      });
    });
});

router.get('/me', checkAuth, (req: JWTRequest, res) => {
  res.status(200).json({
    info: req.auth,
  });
});

module.exports = router;
