import { Request as JWTRequest } from 'express-jwt';

module.exports = (req: JWTRequest, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ message: 'Authentication failed!' });
  }

  if (req.auth.email != process.env.ADMINUSER) {
    return res.status(401).json({ message: 'Insufficient privileges!' });
  }

  next();
};
