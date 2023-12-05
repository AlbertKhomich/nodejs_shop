const express = require('express');
const { check } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getAdminProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  check('title')
    .trim()
    .isAlphanumeric('en-US', { ignore: ' ' })
    .isLength({ min: 1, max: 30 })
    .withMessage('Title need to be from 1 to 30 symbols'),
  check('price').isCurrency().withMessage('Need to be a currency'),
  check('description')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('You have only from 1 to 300 characters'),
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  check('title', 'Title need to be from 1 to 30 symbols')
    .trim()
    .isAlphanumeric('en-US', { ignore: ' ' })
    .isLength({ min: 1, max: 30 }),
  check('price').isCurrency().withMessage('Need to be a currency'),
  check('description')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('You have only from 1 to 300 characters'),
  isAuth,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

// router.get('/add-user',  isAuth, adminController.getAddUser);

// router.post('/add-user',  isAuth, adminController.postAddUser);

// router.get('/user/:userId', isAuth,  adminController.getUser);

module.exports = router;
