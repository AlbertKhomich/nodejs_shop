const express = require('express');
const bodyParcer = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const pageNotFoundController = require('./controllers/404');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

// Templates manager
app.set('view engine', 'ejs');
app.set('views', 'views');

// Auto Encode requests
app.use(bodyParcer.urlencoded({ extended: false }));

// Initialisation of public folder for express
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findUserById('655c7f90d51456d1d04c8b43')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(pageNotFoundController.pageNotFound);

mongoConnect(() => {
  app.listen(3000);
});
