const { fileLoader } = require('ejs');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/orders');
const product = require('../models/product');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');
const { paginate } = require('../util/pagination');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errMsg: [],
    error: false,
    product: {
      title: '',
      imageUrl: '',
      description: '',
      price: '',
    },
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errMsg: 'Attached file is not an image',
      error: true,
      product: {
        title: title,
        description: description,
        price: price,
      },
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errMsg: errors.array()[0].msg,
      error: true,
      product: {
        title: title,
        description: description,
        price: price,
      },
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    // _id: new mongoose.Types.ObjectId('6569dcdfba0b29b74691490b'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddUser = (req, res, next) => {
  res.render('admin/add-user', {
    pageTitle: 'Add User',
    path: '/admin/add-user',
  });
};

exports.postAddUser = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const cart = { items: [] };
  const user = new User(name, email, cart);
  user
    .save()
    .then(() => res.redirect('/admin/add-user'))
    .catch((err) => console.log(err));
};

exports.getUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findUserById(userId)
    .then((user) => {
      console.log(user);
      res.redirect('/');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  // /admin/product-edit/id?edit=true
  const editMode = req.query.edit;
  if (!editMode) res.redirect('/');
  // /admin/product-edit/:params?edit-true
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) res.redirect('/');
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        error: false,
        errMsg: '',
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      error: true,
      errMsg: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        description: updatedDescription,
        price: updatedPrice,
        _id: prodId,
      },
      validationErrors: errors.array(),
    });
  }
  Product.findById(prodId).then((product) => {
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }
    product.title = updatedTitle;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.price = updatedPrice;
    product.description = updatedDescription;
    return product
      .save()
      .then(() => {
        res.redirect('/admin/products');
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((prod) => {
      if (!prod) {
        return next(new Error('Product not found'));
      }
      fileHelper.deleteFile(prod.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then((result) => {
      if (result.deletedCount === 0) return;
      return User.updateMany(
        { 'cart.items.productId': prodId },
        { $pull: { 'cart.items': { productId: prodId } } }
      );
    })
    .then((result) => {
      if (!result) return;
      return Order.updateMany(
        { 'items.productId': prodId },
        { $pull: { items: { productId: prodId } } }
      );
    })
    .then((result) => {
      if (result) {
        console.log(
          `${result.modifiedCount} document(s) in orders collection updated`
        );
        return Order.deleteMany({
          items: { $exists: true, $eq: [] },
        });
      }
      return;
    })
    .then((deleteResult) => {
      if (deleteResult.deletedCount > 0) {
        console.log(
          `${deleteResult.deletedCount} document(s) in orders collection deleted where the array is empty`
        );
      }
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAdminProducts = (req, res, next) => {
  paginate(req, res, 'admin/products', 'Admin Products', '/admin/products');
};
