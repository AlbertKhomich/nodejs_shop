const { fileLoader } = require('ejs');
const Product = require('../models/product');
const User = require('../models/user');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.getAddUser = (req, res, next) => {
  res.render('admin/add-user', {
    pageTitle: 'Add User',
    path: '/admin/add-user',
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const img = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
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
  Product.findById(prodId).then((product) => {
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
  Product.findByIdAndDelete(prodId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.getAdminProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
      });
    })
    .catch((err) => console.log(err));
};
