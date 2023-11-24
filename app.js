const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const bodyParcer = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const pageNotFoundController = require('./controllers/404');
const User = require('./models/user');
const { connect } = require('http2');

const MONGODB_URI =
  'mongodb+srv://alterego:tNXWSnypMpjgrFkX@clusterfirstnodeapp.ubtp1kv.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

// Templates manager
app.set('view engine', 'ejs');
app.set('views', 'views');

// Auto Encode requests
app.use(bodyParcer.urlencoded({ extended: false }));

// Initialisation of public folder for express
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) return next();
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(pageNotFoundController.pageNotFound);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    // const user = new User({
    //   name: 'Albert',
    //   email: 'khomich1022@gmail.com',
    //   password: 1,
    //   cart: { items: [] },
    // });
    // user.save();
    app.listen(3000);
  })
  .catch((err) => console.log(err));
