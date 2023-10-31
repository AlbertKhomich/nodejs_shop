const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
  MongoClient.connect(
    'mongodb+srv://alterego:tNXWSnypMpjgrFkX@clusterfirstnodeapp.ubtp1kv.mongodb.net/shop?retryWrites=true&w=majority'
  )
    .then((client) => {
      _db = client.db();
      cb();
      console.log('connected');
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) return _db;
  throw 'No DB found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
