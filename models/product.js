const getDb = require('../util/database').getDb;
const ObjectId = require('mongodb').ObjectId;

class Product {
  constructor(title, price, description, imageUrl, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
  }

  save() {
    const db = getDb();

    return db
      .collection('products')
      .insertOne(this)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  static update(id, title, price, imageUrl, description) {
    const db = getDb();
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
      },
    };

    return db
      .collection('products')
      .updateOne(filter, updateDoc)
      .then(() => console.log('product updated'))
      .catch((err) => console.log(err));
  }

  static delete(id) {
    const db = getDb();
    const query = { _id: new ObjectId(id) };

    // cascade deleting from order's list. if order's list is empty - delete an order
    db.collection('orders')
      .updateMany({}, { $pull: { items: { _id: new ObjectId(id) } } })
      .then(() => {
        db.collection('orders').deleteMany({
          $expr: { $eq: [{ $size: '$items' }, 0] },
        });
      })
      .catch((err) => console.log(err));

    return db
      .collection('products')
      .deleteOne(query)
      .then(() => console.log('product deleted'))
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();

    return db
      .collection('products')
      .find()
      .toArray()
      .then((prods) => {
        console.log(prods);
        return prods;
      })
      .catch((err) => console.log(err));
  }

  static findById(id) {
    const db = getDb();

    return db
      .collection('products')
      .find({ _id: new ObjectId(id) })
      .toArray()
      .then((prod) => {
        return prod[0];
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
