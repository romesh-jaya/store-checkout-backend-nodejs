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

router.get('/:name', (req, res) => {
  const { name } = req.params;

  if (!name) {
    return res.status(500).json({
      message: 'Missing query params name',
    });
  }

  ProductModel.findOne({
    where: {
      name,
    },
  })
    .then((product) => {
      res.status(200).json({
        product: {
          name: product?.name,
          _id: product?.id,
          barcode: product?.barcode,
          unitPrice: product?.prices,
        },
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: 'Retrieving product failed: ' + error.message,
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
router.get('', checkAuth, (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.currentPage;
  const queryString = req.query.queryString;
  const queryForNameFlag = req.query.queryForNameFlag;

  if (pageSize < 1 || currentPage < 0) {
    return res.status(500).json({
      message:
        'Valid pagesize, page no must be specified when querying products',
    });
  }

  if (!queryString) {
    ProductModel.findAndCountAll({
      offset: pageSize * currentPage,
      limit: pageSize,
    })
      .then((results) => {
        return res.status(200).json({
          products: results.rows.map((row) => ({
            name: row.name,
            _id: row.id,
            barcode: row.barcode,
            unitPrice: row.prices,
          })),
          totalCount: results.count,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: 'Retrieving products failed (all query) : ' + error.message,
        });
      });
  }
});

module.exports = router;
