const express = require('express');
const path = require('path');
const bodyParcer = require('body-parser');

const rootDir = require('./util/path');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// Templates manager
app.set('view engine', 'ejs');
app.set('views', 'views');

// Auto Encode requests
app.use(bodyParcer.urlencoded({ extended: false }));

app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page not found', path: '' });
});

app.listen(3000);
