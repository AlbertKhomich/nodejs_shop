const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const img = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null, title, img, description, price);
  product.save();
  res.redirect('/admin/products');
};

exports.getEditProduct = (req, res, next) => {
  // /admin/product-edit/id?edit=true
  const editMode = req.query.edit;
  if (!editMode) res.redirect('/');
  // /admin/product-edit/:params?edit-true
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    if (!product) res.redirect('/');
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImgUrl = req.body.imgUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImgUrl,
    updatedDescription,
    updatedPrice
  );
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.getDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.delete(prodId);
  res.redirect('/admin/products');
};

exports.getAdminProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products,
    });
  });
};
