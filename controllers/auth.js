const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '3367b305f66176',
    pass: '0dc77abb5ec516',
  },
});

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errMsg: req.flash('error'),
    oldInput: { email: '' },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errMsg: errors.array()[0].msg,
      oldInput: {
        email: email,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      res.redirect('/login');
      return transporter.sendMail({
        from: 'first-node@pp.com',
        to: email,
        subject: 'Signup succeeded',
        html: '<h1>You successfuly signed up!</h1>',
      });
    })
    .catch((err) => console.log(err));
};

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errMsg: req.flash('error'),
    oldInput: { email: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errMsg: errors.array()[0].msg,
      oldInput: { email: email },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      return req.session.save((err) => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/login');
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errMsg: req.flash('error'),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transporter.sendMail({
          from: 'first-node@pp.com',
          to: req.body.email,
          subject: 'Password reset',
          html: `
          <p>You requested password reset</p>
          <p>Click this <a href='http://localhost:3000/reset/${token}'>link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errMsg: req.flash('error'),
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect('/login');
    })
    .catch((err) => console.log(err));
};
