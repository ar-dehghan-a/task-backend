const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {Op} = require('sequelize');
const {promisify} = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) return next(new AppError('ایمیل یا رمز عبور اشتباه است', 401));

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = '';
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('لطفا برای دسترسی وارد شوید', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) return next(new AppError('کاربر متعلق به این توکن دیگر وجود ندارد', 401));

  if (currentUser.changedPasswordAfter(currentUser, decoded.iat))
    return next(new AppError('کاربر جدیدا رمز خود را تغییر داده است. لطفا دوباره وارد شوید', 401));

  req.query.user = currentUser.toJSON();

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.query.user.role))
      return next(new AppError('شما دسترسی به این عملیات را ندارید', 403));

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({where: {email: req.body.email}});
  if (!user) return next(new AppError('کاربری با این ایمیل وجود ندارد', 404));

  const resetToken = await user.createPasswordResetToken(user);
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `رمزت رو فراموش کردی؟ رمز جدید و تایید رمز جدید رو با درخواست پچ بفرست به این آدرس:\n${resetURL}\nاگر رمزت رو فراموش نکردی به این ایمیل اهمیتی نده`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'توکن تغییر پسورد شما (اعتبار تا 10 دقیقه)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'توکن به ایمیل ارسال شد',
    });
  } catch (err) {
    await user.update(
      {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      {
        validate: false,
      }
    );
    return next(new AppError('مشکلی در ارسال ایمیل به وجود آمده است لطفا بعدا تلاش کنید.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        [Op.gt]: Date.now(),
      },
    },
  });

  if (!user) return next(new AppError('توکن شما معتبر نیست یا منقضی شده است.', 400));

  await user.update({
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.query.user.id);

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('رمز عبور فعلی شما اشتباه است', 401));

  await user.update({
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    message: 'رمز عبور با موفقیت تغییر کرد',
    token,
  });
});
