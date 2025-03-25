export {};

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
import { Request as JWTRequest } from 'express-jwt';
import express from 'express';
import { UserModel } from '../../database/models/user.model';
import { User } from '../../models/User';
import { logError } from '../../utils/logger';
import { Product } from '../../models/Product';

const router = express.Router();

const checkAuth = require('../../middleware/check-auth');
const checkSuper = require('../../middleware/check-super');
const checkAdmin = require('../../middleware/check-admin');
import * as constants from '../../constants';
import { Op } from 'sequelize';
import { ProductModel } from '../../database/models/product.model';

router.post('', checkAdmin, (req, res) => {
  const { name, unitPrice, barcode } = req.body;

  if (!name || !unitPrice) {
    return res.status(500).json({
      message: 'Missing body params name and unitPrice',
    });
  }

  const product: Product = {
    name: name,
    prices: unitPrice,
    barcode: barcode,
  };

  ProductModel.create(product)
    .then((createdproduct) => {
      return res.status(201).json({
        message: 'product added successfully',
        productId: createdproduct.id,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: 'Creating product failed : ' + error.message,
      });
    });
});

module.exports = router;
