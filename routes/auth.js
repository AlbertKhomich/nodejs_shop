const express = require('express');
const { check } = require('express-validator');
const bcrypt = require('bcryptjs');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  check('email', 'Please enter a valid email')
    .toLowerCase()
    .isEmail()
    .custom((value) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject('E-mail is not free');
        }
      });
    }),
  check('password', 'Password need to be at least 5 characters long')
    .trim()
    .isLength({
      min: 5,
    }),
  check('confirmPassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Passwords have to match');
      return true;
    }),
  authController.postSignup
);

router.get('/login', authController.getLogin);

router.post(
  '/login',
  check('email', 'Please enter a valid email')
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (!user) {
          return Promise.reject('No user by such email');
        }
      });
    }),
  check('password')
    .isLength({
      min: 5,
    })
    .withMessage('Password need to be at least 5 characters long')
    .custom((value, { req }) => {
      return User.findOne({ email: req.body.email })
        .then((user) => {
          if (!user) return;
          return bcrypt.compare(value, user.password);
        })
        .then((doMatch) => {
          if (!doMatch) {
            return Promise.reject('Invalid password');
          }
        });
    }),
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
