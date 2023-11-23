const Product = require('../models/product');
const mongoose = require('mongoose');
const User = require('../models/user');
const Order = require('../models/orders');
// const Cart = require('../models/cart');
// const Order = require('../models/order');

exports.getShop = (req, res, next) => {
  res.render('shop/index', {
    pageTitle: 'My Shop',
    path: '/',
  });
};

exports.getProductList = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/product-list',
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/product-list',
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId').then((user) => {
    products = user.cart.items;
    res.render('shop/cart', {
      pageTitle: 'Cart',
      path: '/cart',
      products: products,
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.postDeleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  User.updateOne(
    { _id: req.user._id },
    {
      $pull: {
        'cart.items': { productId: new mongoose.Types.ObjectId(prodId) },
      },
    }
  )
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => console.log(err));
};
//this.cart.items.productId.title
exports.getOrders = (req, res, next) => {
  Order.find({ userId: req.user })
    .populate('items.productId')
    .exec()
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Orders',
        path: '/orders',
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '',
  });
};
