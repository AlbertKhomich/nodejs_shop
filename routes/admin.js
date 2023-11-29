const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getAdminProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.get(
  '/delete-product/:productId',
  isAuth,
  adminController.getDeleteProduct
);

// router.get('/add-user',  isAuth, adminController.getAddUser);

// router.post('/add-user',  isAuth, adminController.postAddUser);

// router.get('/user/:userId', isAuth,  adminController.getUser);

module.exports = router;
