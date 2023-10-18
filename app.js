const express = require('express');
const path = require('path');
const bodyParcer = require('body-parser');
const expressHbs = require('express-handlebars');

const rootDir = require('./util/path');
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// Templates manager
// Express-handlebar
app.engine(
  'hbs',
  expressHbs.engine({
    extname: 'hbs',
    defaultLayout: 'main-layout',
    layoutsDir: '',
  })
);
app.set('view engine', 'hbs');
app.set('views', 'views');

// Auto Encode requests
app.use(bodyParcer.urlencoded({ extended: false }));

app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page not found' });
});

app.listen(3000);
