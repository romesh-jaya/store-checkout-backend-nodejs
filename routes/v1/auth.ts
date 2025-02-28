export {};

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
import { Request as JWTRequest } from 'express-jwt';
import express from 'express';
import { UserModel } from '../../database/models/user.model';
import { User } from '../../models/User';
import { logError } from '../../utils/logger';

const router = express.Router();

const checkAuth = require('../../middleware/check-auth');
const checkSuper = require('../../middleware/check-super');
import * as constants from '../../constants';
import { Op } from 'sequelize';

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
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.HASHSECRET,
          {
            expiresIn: process.env.TOKENEXPIRATION,
          }
        );
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

      const token = jwt.sign(
        { id: fetchedUser.id, email: fetchedUser.email },
        process.env.HASHSECRET,
        {
          expiresIn: process.env.TOKENEXPIRATION,
        }
      );
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

router.get('', checkSuper, (_, res) => {
  UserModel.findAll()
    .then((documents) => {
      let retArray: { _id: number; email: string; isAdmin: boolean }[] = [];

      //prevent sending passwords
      documents.forEach((document) => {
        if (document.email != process.env.ADMINUSER) {
          //Don't pass the admin user to the client, as we cannot change any settings related to this
          retArray.push({
            _id: document.id,
            email: document.email,
            isAdmin: document.is_admin,
          });
        }
      });

      res.status(200).json(retArray);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Retrieving users failed: ' + error.message,
      });
    });
});

router.delete('/:id', checkSuper, (req, res) => {
  UserModel.update(
    { status: constants.USER_STATUS_INACTIVE },
    {
      where: {
        id: req.params.id,
        email: {
          [Op.not]: process.env.ADMINUSER,
        },
      },
    }
  )
    .then((result) => {
      if (result[0] > 0) {
        res.status(200).json({ message: 'user set to inactive!' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Deleting user failed: ' + error.message,
      });
    });
});

router.patch('/:id', checkSuper, (req, res) => {
  UserModel.update(
    { is_admin: req.body.isAdmin },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((result) => {
      if (result[0] > 0) {
        res.status(200).json({ message: 'user updated!' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Updating user failed: ' + error.message,
      });
    });
});

module.exports = router;
