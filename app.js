const express = require('express');
const path = require('path');
const bodyParcer = require('body-parser');

const rootDir = require('./util/path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// Auto Encode requests
app.use(bodyParcer.urlencoded({ extended: false }));

app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});

app.listen(3000);
