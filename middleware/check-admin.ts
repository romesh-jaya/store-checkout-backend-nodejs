import { Request as JWTRequest } from 'express-jwt';
import { UserModel } from '../database/models/user.model';

module.exports = (req: JWTRequest, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ message: 'Authentication failed!' });
  }

  if (req.auth.email == process.env.ADMINUSER) {
    next();
  }

  // Check if user is marked as Admin
  UserModel.findOne({
    where: {
      email: req.auth.email,
    },
  }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed!' });
    }
    if (user.is_admin) {
      next();
    }
    return res.status(401).json({ message: 'Insufficient privileges!' });
  });
};
