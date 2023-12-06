const express = require('express');
const path = require('path');
const stripe = require('stripe')(
  'sk_test_51OJueZLJW4VKEQvlHlxUCWop5E8qBDqNJqNbnBGr05XpJztEM918AN77rfDtfNz232M9x24gRlPHZivwxdkcQULN00JeBofJOG'
);

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getShop);

router.get('/product-list', shopController.getProductList);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postDeleteCartProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/secret/:paymentId', isAuth, shopController.getSecret);

router.get('/checkout/success', isAuth, shopController.postOrder);

module.exports = router;
