const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id =>
  jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(newUser.id);
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) return next(new AppError('لطفا ایمیل و پسورد خود را وارد کنید', 400));

  const user = await User.findOne({where: {email: req.body.email}});
  if (!user) return next(new AppError('ایمیل یا رمز عبور اشتباه است', 401));

  const correct = user.correctPassword(password, user.password);
  if (!correct) return next(new AppError('ایمیل یا رمز عبور اشتباه است', 401));

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('لطفا برای دسترسی وارد شوید', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findByPk(decoded.id, {
    attributes: {
      exclude: ['password', 'confirmPassword'],
    },
  });
  if (!currentUser) next(new AppError('کاربر متعلق به این توکن دیگر وجود ندارد', 401));

  if (currentUser.changedPasswordAfter(currentUser, decoded.iat))
    return next(new AppError('کاربر جدیدا رمز خود را تغییر داده است. لطفا دوباره وارد شوید', 401));

  req.query.user = currentUser.toJSON();

  next();
});
