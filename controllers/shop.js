const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const mongoose = require('mongoose');
const User = require('../models/user');
const Order = require('../models/orders');
const { ITEMS_PER_PAGE } = require('../config');

exports.getShop = (req, res, next) => {
  res.render('shop/index', {
    pageTitle: 'My Shop',
    path: '/',
  });
};

exports.getProductList = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return;
    })
    .then(() => {
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log(err);
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '',
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .populate('items.productId')
    .exec()
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'));
      }
      if (order.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      // crossOS path
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', { underline: true });
      pdfDoc.text('_____________________________');
      let totalPrice = 0;
      order.items.forEach((prod) => {
        totalPrice += prod.quantity * prod.productId.price;
        pdfDoc.fontSize(14).text(
          `
          ${prod.productId.title}: ${prod.quantity} x ${prod.productId.price}$`
        );
      });
      pdfDoc.fontSize(20).text(`
      ______________________
      Total: ${totalPrice.toFixed(2)}$`);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   // res.setHeader('Content-Disposition', `attachment; filename=${invoiceName}`);
      //   res.setHeader('Content-Disposition', 'inline');
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(next);
};
