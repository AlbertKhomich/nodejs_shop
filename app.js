const express = require('express');
const bodyParcer = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const pageNotFoundController = require('./controllers/404');
const User = require('./models/user');
const { connect } = require('http2');

const app = express();

// Templates manager
app.set('view engine', 'ejs');
app.set('views', 'views');

// Auto Encode requests
app.use(bodyParcer.urlencoded({ extended: false }));

// Initialisation of public folder for express
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('655e2d72b0470c8038d56fae')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(pageNotFoundController.pageNotFound);

mongoose
  .connect(
    'mongodb+srv://alterego:tNXWSnypMpjgrFkX@clusterfirstnodeapp.ubtp1kv.mongodb.net/shop'
  )
  .then(() => {
    // const user = new User({
    //   name: 'Albert',
    //   email: 'khomich1022@gmail.com',
    //   cart: { items: [] },
    // });
    // user.save();
    app.listen(3000);
  })
  .catch((err) => console.log(err));
