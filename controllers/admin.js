const { fileLoader } = require('ejs');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/orders');
const product = require('../models/product');
const { validationResult } = require('express-validator');

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
  const img = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
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
        imageUrl: img,
        description: description,
        price: price,
      },
      validationErrors: errors.array(),
    });
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: img,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
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
    .catch((err) => console.log(err));
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
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImgUrl = req.body.imageUrl;
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
        imageUrl: updatedImgUrl,
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
    product.imageUrl = updatedImgUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;
    return product
      .save()
      .then(() => {
        res.redirect('/admin/products');
      })
      .catch((err) => console.log(err));
  });
};

exports.getDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  return Product.deleteOne({ _id: prodId, userId: req.user._id })
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
      console.error(err);
    });
};

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
        // isAuthenticated: req.session.isLoggedIn,
        // user: req.user,
      });
    })
    .catch((err) => console.log(err));
};
