const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {DataTypes} = require('sequelize');
const sequelize = require('../utils/database');
const AppError = require('../utils/appError');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      readOnly: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'لطفا نام خود را وارد کنید'},
        notEmpty: {msg: 'نام نمی‌تواند خالی باشد'},
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: {msg: 'ایمیل نباید تکراری باشد'},
      allowNull: false,
      validate: {
        isEmail: {msg: 'ایمیل اشتباه است'},
        notNull: {msg: 'ایمیل اجباری است'},
        isLowercase: true,
      },
    },
    photo: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'رمز اجباری است'},
        len: {
          args: [8],
          msg: 'رمز باید بیش از ۸ کاراکتر باشد',
        },
      },
    },
    confirmPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['admin', 'user']],
      },
      defaultValue: 'user',
    },
    passwordChangedAt: DataTypes.DATE,
    passwordResetToken: DataTypes.STRING,
    passwordResetExpires: DataTypes.DATE,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    defaultScope: {
      where: {
        active: true,
      },
    },
  }
);

User.beforeValidate(user => {
  if (user.password !== user.confirmPassword) {
    throw new AppError('رمز عبور و تکرار آن باید با هم برابر باشند', 400);
  }
});

User.beforeSave(async (user, options) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
    user.confirmPassword = null;
    options.validate = false;
  }
});

User.beforeUpdate(async user => {
  if (user.changed('password')) {
    user.passwordChangedAt = Date.now() - 1000;
  }
});

User.prototype.correctPassword = async (candidatePassword, userPassword) =>
  bcrypt.compareSync(candidatePassword, userPassword);

User.prototype.changedPasswordAfter = (user, JWTTimestamp) => {
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

User.prototype.createPasswordResetToken = async user => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  await user.update(
    {
      passwordResetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
      passwordResetExpires: Date.now() + 10 * 60 * 1000,
    },
    {
      validate: false,
    }
  );

  return resetToken;
};

module.exports = User;
