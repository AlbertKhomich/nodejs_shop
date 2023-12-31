const mongoose = require('mongoose');
const Order = require('../models/orders');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addOrder = function () {
  const order = new Order({
    items: this.cart.items,
    userId: this._id,
  });
  this.cart = { items: [] };
  return order.save().then(() => {
    this.save();
  });
};

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
// const { ObjectId } = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart; //{items: []}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();

//     return db
//       .collection('users')
//       .insertOne(this)
//       .then((result) => console.log(result))
//       .catch((err) => console.log(err));
//   }

//   deleteFromCart(prodId) {
//     const cartProductIndex = this.cart.items.findIndex(
//       (cp) => cp.productId.toString() === prodId
//     );
//     const updatedCartItems = [...this.cart.items];
//     updatedCartItems.splice(cartProductIndex, 1);
//     const updatedCart = { items: updatedCartItems };
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new Object(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(
//       (cp) => cp.productId.toString() === product._id.toString()
//     );
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new Object(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const db = getDb();
//     const prodIds = this.cart.items.map((i) => {
//       return i.productId;
//     });
//     return db
//       .collection('products')
//       .find({ _id: { $in: prodIds } })
//       .toArray()
//       .then((prods) => {
//         return prods.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find((i) => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   addOrder() {
//     const db = getDb();
//     this.getCart().then((products) => {
//       const order = {
//         items: products,
//         user: {
//           _id: new ObjectId(this._id),
//           name: this.name,
//           email: this.email,
//         },
//       };
//       db.collection('orders').insertOne(order);
//     });

//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: [] } } }
//       );
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': new ObjectId(this._id) })
//       .toArray();
//   }

//   static findUserById(userId) {
//     const db = getDb();

//     return db
//       .collection('users')
//       .find({ _id: new ObjectId(userId) })
//       .toArray()
//       .then((user) => {
//         return user[0];
//       })
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = User;
