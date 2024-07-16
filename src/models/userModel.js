const bcrypt = require('bcryptjs');

const {DataTypes} = require('sequelize');
const sequelize = require('../utils/database');
const AppError = require('../utils/appError');

const User = sequelize.define('User', {
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
});

User.beforeValidate(user => {
  if (user.password !== user.confirmPassword) {
    throw new AppError('رمز عبور و تکرار آن باید با هم برابر باشند', 400);
  }
});

User.beforeSave(async user => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
    user.confirmPassword = undefined;
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

// User.prototype.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//   console.log({resetToken}, this.passwordResetToken);

//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

//   return resetToken;
// };

module.exports = User;
