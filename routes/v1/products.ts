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
      if (error.name && error.name == 'SequelizeUniqueConstraintError') {
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError.path && firstError.path == 'name') {
            return res.status(500).json({
              message: 'Product Name already exists',
            });
          }
        }
      }

      return res.status(500).json({
        message: 'Creating product failed : ' + error.message,
      });
    });
});

router.delete('/:id', checkAdmin, (req, res) => {
  ProductModel.update(
    { status: constants.STATUS_INACTIVE },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((result) => {
      if (result[0] > 0) {
        res.status(200).json({ message: 'product set to inactive!' });
      } else {
        res.status(404).json({ message: 'product not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Deleting product failed: ' + error.message,
      });
    });
});

router.patch('/:id', checkAdmin, (req, res) => {
  const product: Product = {
    name: req.body.name,
    prices: req.body.unitPrice,
    barcode: req.body.barcode,
  };

  ProductModel.update(
    { ...product },
    {
      where: {
        id: +req.params.id,
      },
    }
  )
    .then((result) => {
      if (result[0] > 0) {
        return res.status(200).json({ message: 'Update successful!' });
      } else {
        return res.status(404).json({ message: 'product not found' });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: 'Updating product failed: ' + error.message,
      });
    });
});

//Pass 4 query params into this method for the case of query, none for populate
router.get('', checkAuth, async (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.currentPage;
  const queryForName = req.query.queryForName;
  const queryForBarcode = req.query.queryForBarcode;
  const showInactiveProducts = req.query.showInactiveProducts;
  const name = req.query.name;

  // query by product name
  if (name) {
    try {
      const product = await ProductModel.findOne({
        where: {
          name,
          ...(!showInactiveProducts && { status: constants.STATUS_ACTIVE }),
        },
      });
      return res.status(200).json({
        product: {
          name: product?.name,
          _id: product?.id,
          barcode: product?.barcode,
          unitPrice: product?.prices,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Retrieving product failed: ' + (error as any).message,
      });
    }
  }

  if (pageSize < 1 || currentPage < 0) {
    return res.status(500).json({
      message:
        'Valid pagesize, page no must be specified when querying products',
    });
  }

  const whereClause = {
    where: {
      ...(queryForName && { name: { [Op.iLike]: `%${queryForName}%` } }),
      ...(queryForBarcode && {
        barcode: { [Op.iLike]: `%${queryForBarcode}%` },
      }),
      ...(!showInactiveProducts && { status: constants.STATUS_ACTIVE }),
    },
  };

  try {
    const results = await ProductModel.findAndCountAll({
      ...whereClause,
      offset: pageSize * currentPage,
      limit: pageSize,
    });
    return res.status(200).json({
      products: results.rows.map((row) => ({
        name: row.name,
        _id: row.id,
        barcode: row.barcode,
        unitPrice: row.prices,
      })),
      totalCount: results.count,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Retrieving product failed: ' + (error as any).message,
    });
  }
});

module.exports = router;
